from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['alpaca_order_id', 'created_at', 'filled_at', 'user']

class OrderCreateSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=20)
    side = serializers.ChoiceField(choices=['buy', 'sell'])
    notional = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    qty = serializers.DecimalField(max_digits=15, decimal_places=8, required=False)

    def validate(self, data):
        if not data.get('notional') and not data.get('qty'):
            raise serializers.ValidationError("Either 'notional' or 'qty' is required")
        if data.get('notional') and data.get('qty'):
            raise serializers.ValidationError("Provide either 'notional' or 'qty', not both")
        return data
