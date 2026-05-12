from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Portfolio, Allocation
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seed portfolio data for all users'

    def handle(self, *args, **options):
        for user in User.objects.all():
            portfolio, created = Portfolio.objects.get_or_create(
                user=user,
                defaults={
                    'total_balance': Decimal('124500.00'),
                    'invested_balance': Decimal('112050.00'),
                    'available_cash': Decimal('12450.00'),
                    'daily_change_percentage': Decimal('1.02'),
                    'daily_change_amount': Decimal('1250.00'),
                }
            )

            if created:
                allocations = [
                    {'name': 'Green Energy Fund', 'amount': 34200, 'percentage': 27.5, 'esg_tag': 'ESG/Halal', 'return': 2.4},
                    {'name': 'Fair Trade Tech', 'amount': 18450, 'percentage': 14.8, 'esg_tag': 'Low Carbon', 'return': 1.1},
                    {'name': 'US ETF', 'amount': 25000, 'percentage': 20.0, 'esg_tag': '', 'return': 0},
                    {'name': 'Europe ETF', 'amount': 37500, 'percentage': 30.0, 'esg_tag': '', 'return': 0},
                    {'name': 'Tech ETF', 'amount': 62500, 'percentage': 50.0, 'esg_tag': '', 'return': 0},
                ]

                for alloc in allocations:
                    Allocation.objects.create(
                        portfolio=portfolio,
                        name=alloc['name'],
                        amount=Decimal(str(alloc['amount'])),
                        percentage=Decimal(str(alloc['percentage'])),
                        esg_tag=alloc.get('esg_tag', ''),
                        return_percentage=Decimal(str(alloc.get('return', 0))),
                    )

                self.stdout.write(f"Created portfolio for {user.email}")
            else:
                self.stdout.write(f"Portfolio already exists for {user.email}")
