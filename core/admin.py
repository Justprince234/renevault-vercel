from django.contrib import admin

from .models import History, Contact, Blog
# Register your models here.

class HistoryAdmin(admin.ModelAdmin):
    
    list_display = ('id','user', 'account_number')
    list_display_links = ('id', 'user')
    search_fields = ('user',)
    list_per_page = 25

admin.site.register(History, HistoryAdmin)

class ContactAdmin(admin.ModelAdmin):
    
    list_display = ('id','full_name', 'email')
    list_display_links = ('id', 'email')
    search_fields = ('email',)
    list_per_page = 25

admin.site.register(Contact, ContactAdmin)

class BlogAdmin(admin.ModelAdmin):
    
    list_display = ('id','title')
    prepopulated_fields = {'slug': ('title',)}
    list_display_links = ('id', 'title')
    search_fields = ('title',)
    list_per_page = 25

admin.site.register(Blog, BlogAdmin)
