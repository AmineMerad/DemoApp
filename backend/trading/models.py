from django.db import models
from django.contrib.auth.models import User

class Order(models.Model):
    SIDE_CHOICES = [
        ('buy', 'Buy'),
        ('sell', 'Sell'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('filled', 'Filled'),
        ('canceled', 'Canceled'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    symbol = models.CharField(max_length=20)
    side = models.CharField(max_length=10, choices=SIDE_CHOICES)
    qty = models.DecimalField(max_digits=15, decimal_places=8, null=True, blank=True)
    notional = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    order_type = models.CharField(max_length=20, default='market')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    filled_qty = models.DecimalField(max_digits=15, decimal_places=8, null=True, blank=True)
    filled_avg_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    alpaca_order_id = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    filled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.side.upper()} {self.symbol} - {self.status}"
