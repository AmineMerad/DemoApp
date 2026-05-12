from django.contrib import admin
from .models import Portfolio, Allocation, Transaction

admin.site.register(Portfolio)
admin.site.register(Allocation)
admin.site.register(Transaction)
