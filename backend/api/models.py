from django.db import models
from django.contrib.auth.models import User
import uuid

class Portfolio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio')
    total_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    invested_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    available_cash = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    daily_change_percentage = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    daily_change_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Portfolio"

class Allocation(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='allocations')
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    esg_tag = models.CharField(max_length=50, blank=True)
    low_carbon = models.BooleanField(default=False)
    halal_certified = models.BooleanField(default=False)
    return_percentage = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    class Meta:
        ordering = ['-amount']

    def __str__(self):
        return f"{self.name}: {self.percentage}%"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('rebalance', 'Rebalance'),
    ]

    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    from_account = models.CharField(max_length=200, blank=True)
    to_account = models.CharField(max_length=200, blank=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.transaction_id} - {self.type} - ${self.amount}"
