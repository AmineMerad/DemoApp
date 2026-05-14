import os
import logging
from decimal import Decimal
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockLatestQuoteRequest

from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer

logger = logging.getLogger(__name__)


def get_alpaca_clients():
    key = os.environ.get("APCA_API_KEY_ID")
    secret = os.environ.get("APCA_API_SECRET_KEY")
    if not key or not secret:
        return None, None
    return (
        TradingClient(key, secret, paper=True),
        StockHistoricalDataClient(key, secret),
    )


class MarketViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def assets(self, request):
        trading_client, _ = get_alpaca_clients()
        if not trading_client:
            return Response({"error": "Alpaca not configured"}, status=500)

        search = request.query_params.get('search', '').upper()
        asset_type = request.query_params.get('type', '')

        try:
            assets = trading_client.get_all_assets()
        except Exception as e:
            logger.error(f"Alpaca assets error: {e}")
            return Response({"error": str(e)}, status=500)

        results = []
        for a in assets:
            if a.tradable and a.status == 'active':
                if search and search not in a.symbol and search not in (a.name or '').upper():
                    continue
                if asset_type == 'stock' and a.asset_class != 'us_equity':
                    continue
                if asset_type == 'etf' and 'ETF' not in (a.name or '') and 'ETF' not in a.symbol:
                    shortable = getattr(a, 'shortable', False) or getattr(a, 'easy_to_borrow', False)
                    if shortable:
                        continue
                if asset_type == 'crypto' and a.asset_class != 'crypto':
                    continue
                results.append({
                    'symbol': a.symbol,
                    'name': a.name,
                    'asset_class': a.asset_class,
                    'tradable': a.tradable,
                    'marginable': a.marginable,
                    'shortable': a.shortable,
                    'easy_to_borrow': a.easy_to_borrow,
                })

        results.sort(key=lambda x: x['symbol'])
        return Response(results[:100])

    @action(detail=False, methods=['get'])
    def quotes(self, request):
        _, data_client = get_alpaca_clients()
        if not data_client:
            return Response({"error": "Alpaca not configured"}, status=500)

        symbols_str = request.query_params.get('symbols', '')
        symbols = [s.strip().upper() for s in symbols_str.split(',') if s.strip()]
        if not symbols:
            return Response({"error": "Provide ?symbols=AAPL,SPY"}, status=400)

        stock_symbols = [s for s in symbols if '/' not in s]
        crypto_symbols = [s for s in symbols if '/' in s]

        result = {}

        if stock_symbols:
            try:
                req = StockLatestQuoteRequest(symbol_or_symbols=stock_symbols)
                quotes = data_client.get_stock_latest_quote(req)
                for sym, q in quotes.items():
                    result[sym] = {
                        'symbol': sym,
                        'bid': float(q.bid_price) if q.bid_price else None,
                        'ask': float(q.ask_price) if q.ask_price else None,
                        'spread': round(float(q.ask_price - q.bid_price), 2) if q.bid_price and q.ask_price else None,
                    }
            except Exception as e:
                logger.warning(f"Stock quotes error: {e}")

        return Response(result)


class TradingViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def account(self, request):
        client, _ = get_alpaca_clients()
        if not client:
            return Response({"error": "Alpaca not configured"}, status=500)
        try:
            acct = client.get_account()
            return Response({
                'buying_power': float(acct.buying_power),
                'cash': float(acct.cash),
                'portfolio_value': float(acct.portfolio_value),
                'equity': float(acct.equity),
                'daytrade_count': acct.daytrade_count,
                'status': acct.status,
                'currency': acct.currency,
            })
        except Exception as e:
            logger.error(f"Alpaca account error: {e}")
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def positions(self, request):
        client, _ = get_alpaca_clients()
        if not client:
            return Response({"error": "Alpaca not configured"}, status=500)
        try:
            positions = client.get_all_positions()
            return Response([
                {
                    'symbol': p.symbol,
                    'qty': float(p.qty),
                    'market_value': float(p.market_value),
                    'cost_basis': float(p.cost_basis),
                    'unrealized_pl': float(p.unrealized_pl),
                    'unrealized_plpc': float(p.unrealized_plpc),
                    'current_price': float(p.current_price),
                    'avg_entry_price': float(p.avg_entry_price),
                    'change_today': float(p.change_today),
                }
                for p in positions
            ])
        except Exception as e:
            logger.error(f"Alpaca positions error: {e}")
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['get', 'post'])
    def orders(self, request):
        if request.method == 'GET':
            return self._list_orders(request)
        return self._create_order(request)

    def _list_orders(self, request):
        client, _ = get_alpaca_clients()
        if not client:
            return Response({"error": "Alpaca not configured"}, status=500)

        status_filter = request.query_params.get('status', '')
        try:
            from alpaca.trading.enums import QueryOrderStatus
            params = {}
            if status_filter:
                params['status'] = QueryOrderStatus(status_filter)
            alpaca_orders = client.get_orders(**params)
        except Exception as e:
            logger.error(f"Alpaca orders error: {e}")
            return Response({"error": str(e)}, status=500)

        return Response([
            {
                'id': o.id,
                'symbol': o.symbol,
                'side': o.side,
                'qty': float(o.qty) if o.qty else None,
                'notional': float(o.notional) if hasattr(o, 'notional') and o.notional else None,
                'type': o.type,
                'status': o.status,
                'filled_qty': float(o.filled_qty) if o.filled_qty else None,
                'filled_avg_price': float(o.filled_avg_price) if o.filled_avg_price else None,
                'created_at': o.created_at.isoformat() if o.created_at else None,
                'filled_at': o.filled_at.isoformat() if o.filled_at else None,
            }
            for o in alpaca_orders
        ])

    def _create_order(self, request):
        client, _ = get_alpaca_clients()
        if not client:
            return Response({"error": "Alpaca not configured"}, status=500)

        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        side = OrderSide.BUY if data['side'] == 'buy' else OrderSide.SELL

        order_params = {
            'symbol': data['symbol'],
            'side': side,
            'time_in_force': TimeInForce.DAY,
        }
        if 'notional' in data:
            order_params['notional'] = float(data['notional'])
        if 'qty' in data:
            order_params['qty'] = float(data['qty'])

        order_request = MarketOrderRequest(**order_params)

        try:
            result = client.submit_order(order_request)
        except Exception as e:
            logger.error(f"Alpaca submit order error: {e}")
            return Response({"error": str(e)}, status=500)

        order = Order.objects.create(
            user=request.user,
            symbol=result.symbol,
            side=data['side'],
            qty=float(result.qty) if result.qty else None,
            notional=float(result.notional) if hasattr(result, 'notional') and result.notional else None,
            order_type='market',
            status=result.status,
            filled_qty=float(result.filled_qty) if result.filled_qty else None,
            filled_avg_price=float(result.filled_avg_price) if result.filled_avg_price else None,
            alpaca_order_id=result.id,
            filled_at=result.filled_at if result.filled_at else None,
        )

        order_serializer = OrderSerializer(order)
        return Response(order_serializer.data, status=status.HTTP_201_CREATED)
