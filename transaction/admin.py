from django.contrib import admin

from .models import InternationalTransfer, LocalTransfer
# Register your models here.

class InternationalTransferAdmin(admin.ModelAdmin):
    
    list_display = ('id','owner', 'to_account')
    list_display_links = ('id', 'owner')
    search_fields = ('owner',)
    list_per_page = 25

admin.site.register(InternationalTransfer, InternationalTransferAdmin)

class LocalTransferAdmin(admin.ModelAdmin):
    
    list_display = ('id','owner', 'to_account')
    list_display_links = ('id', 'owner')
    search_fields = ('owner',)
    list_per_page = 25

admin.site.register(LocalTransfer, LocalTransferAdmin)