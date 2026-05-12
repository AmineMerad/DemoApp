from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from .models import Portfolio, Allocation, Transaction
from .serializers import (
    PortfolioSerializer, TransactionSerializer,
    DepositSerializer, WithdrawSerializer, RebalanceSerializer
)
import uuid
from decimal import Decimal

class PortfolioViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        portfolio, created = Portfolio.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(portfolio)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_allocations(self, request):
        portfolio, created = Portfolio.objects.get_or_create(user=request.user)

        portfolio.allocations.all().delete()

        allocations_data = request.data.get('allocations', [])
        for alloc_data in allocations_data:
            Allocation.objects.create(
                portfolio=portfolio,
                name=alloc_data['name'],
                amount=alloc_data.get('amount', 0),
                percentage=alloc_data['percentage'],
                esg_tag=alloc_data.get('esg_tag', ''),
                low_carbon=alloc_data.get('low_carbon', False),
                halal_certified=alloc_data.get('halal_certified', False),
            )

        serializer = self.get_serializer(portfolio)
        return Response(serializer.data)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)

        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)

        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        transaction = self.get_object()
        if not request.user.is_staff:
            return Response(
                {'error': 'Only admins can delete transactions'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def deposit(self, request):
        serializer = DepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data['amount']

        transaction = Transaction.objects.create(
            user=request.user,
            transaction_id=f"WST-{uuid.uuid4().hex[:8].upper()}",
            type='deposit',
            amount=amount,
            status='completed',
            from_account=serializer.validated_data.get('from_account', 'Cash Account'),
            to_account=serializer.validated_data.get('to_account', 'Investment Portfolio'),
            fee=Decimal('0.00'),
            completed_at=timezone.now(),
        )

        portfolio, created = Portfolio.objects.get_or_create(user=request.user)
        portfolio.total_balance += amount
        portfolio.available_cash += amount
        portfolio.save()

        response_serializer = TransactionSerializer(transaction)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def withdraw(self, request):
        serializer = WithdrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data['amount']
        portfolio = Portfolio.objects.get(user=request.user)

        if portfolio.available_cash < amount:
            return Response(
                {'error': 'Insufficient available cash balance'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transaction = Transaction.objects.create(
            user=request.user,
            transaction_id=f"WST-{uuid.uuid4().hex[:8].upper()}",
            type='withdrawal',
            amount=amount,
            status='completed',
            from_account='Investment Portfolio',
            to_account=serializer.validated_data.get('to_account', 'Bank Account'),
            fee=Decimal('0.00'),
            completed_at=timezone.now(),
        )

        portfolio.total_balance -= amount
        portfolio.available_cash -= amount
        portfolio.save()

        response_serializer = TransactionSerializer(transaction)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def rebalance(self, request):
        serializer = RebalanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        portfolio = Portfolio.objects.get(user=request.user)
        allocations_data = serializer.validated_data['allocations']

        before_allocations = [
            {'name': a.name, 'percentage': float(a.percentage)}
            for a in portfolio.allocations.all()
        ]

        for alloc_data in allocations_data:
            allocation = portfolio.allocations.filter(name=alloc_data['name']).first()
            if allocation:
                allocation.percentage = Decimal(str(alloc_data['percentage']))
                allocation.amount = portfolio.total_balance * allocation.percentage / 100
                allocation.save()

        transaction = Transaction.objects.create(
            user=request.user,
            transaction_id=f"WST-{uuid.uuid4().hex[:8].upper()}",
            type='rebalance',
            status='completed',
            description='Portfolio rebalance completed',
            metadata={
                'before_allocations': before_allocations,
                'after_allocations': allocations_data,
            },
            completed_at=timezone.now(),
        )

        response_serializer = TransactionSerializer(transaction)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class CalculationsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        portfolio = Portfolio.objects.get(user=request.user)

        total_invested = portfolio.allocations.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0')

        return Response({
            'total_balance': portfolio.total_balance,
            'invested_balance': portfolio.invested_balance,
            'available_cash': portfolio.available_cash,
            'daily_change_percentage': portfolio.daily_change_percentage,
            'daily_change_amount': portfolio.daily_change_amount,
            'total_invested': total_invested,
            'last_updated': portfolio.updated_at,
        })

    @action(detail=False, methods=['get'])
    def history(self, request):
        return Response({
            'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            'values': [124500, 125200, 124800, 125500, 126100, 125900, 126200],
        })
