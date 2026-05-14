from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MarketViewSet, TradingViewSet

router = DefaultRouter()
router.register(r'market', MarketViewSet, basename='market')
router.register(r'trading', TradingViewSet, basename='trading')

urlpatterns = [
    path('', include(router.urls)),
]
