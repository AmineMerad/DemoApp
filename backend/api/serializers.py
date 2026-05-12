from rest_framework import serializers
from decimal import Decimal
from .models import Portfolio, Allocation, Transaction

class AllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allocation
        fields = ['id', 'name', 'amount', 'percentage', 'esg_tag', 'low_carbon', 'halal_certified', 'return_percentage']

class PortfolioSerializer(serializers.ModelSerializer):
    allocations = AllocationSerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = ['total_balance', 'invested_balance', 'available_cash',
                 'daily_change_percentage', 'daily_change_amount', 'allocations', 'updated_at']
        read_only_fields = ['updated_at']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['transaction_id', 'created_at', 'completed_at']

class DepositSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=Decimal('0.01'))
    from_account = serializers.CharField(max_length=200, required=False, default='Cash Account')
    to_account = serializers.CharField(max_length=200, required=False, default='Investment Portfolio')

class WithdrawSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=Decimal('0.01'))
    to_account = serializers.CharField(max_length=200, required=False, default='Bank Account')

class RebalanceSerializer(serializers.Serializer):
    allocations = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of allocations with name and percentage"
    )
