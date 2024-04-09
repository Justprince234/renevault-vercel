from django.contrib import admin

from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UpdateUser
# Register your models here.
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('status','email', 'first_name', 'middle_name', 'surname', 'date_of_birth', 'phone', 'address', 'account_number', 'paul_date', 'password', 'last_login')}),
        ('Permissions', {'fields': (
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
            'user_permissions',
        )}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('email', 'password1', 'password2')
            }
        ),
    )

    list_display = ('email', 'first_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)


admin.site.register(User, UserAdmin)

class UpdateUserAdmin(admin.ModelAdmin):

    list_display = ('id', 'user', 'available_balance')  
    list_display_links = ('id', 'user')
    search_fields = ('user',)
    list_per_page = 25

admin.site.register(UpdateUser, UpdateUserAdmin)

# Register your models here.
admin.site.site_header = 'Mbrybn Access Bank'
admin.site.site_title = 'Mbrybn Access Bank'
admin.site.index_title = 'Mbrybn Access Bank Admin'