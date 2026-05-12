from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortfolioViewSet, TransactionViewSet, CalculationsViewSet

router = DefaultRouter()
router.register(r'portfolio', PortfolioViewSet, basename='portfolio')
router.register(r'transactions', TransactionViewSet, basename='transactions')
router.register(r'calculations', CalculationsViewSet, basename='calculations')

urlpatterns = [
    path('', include(router.urls)),
]
