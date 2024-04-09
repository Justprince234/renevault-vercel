from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('registration/', views.registration, name='registration'),
    path('activate/<uidb64>/<token>', views.activate, name='activate'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('contact-us/', views.contact_us, name='contact-us'),
    path('products/', views.our_products, name='our-products'),
    path('helpful-forms/', views.helpful_forms, name='helpful-forms'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('history/', views.history, name='history'),
    path('payment/', views.payment, name='payment'),
    path('updated-profile/', views.updated_profile, name='updated_profile'),
    path('international/', views.international, name='international'),
    path('local/', views.local, name='local'),
    path('profile/', views.profile, name='profile'),
    path('success/', views.success, name='success'),
    path('about-us/', views.aboutUs, name='about-us'),
    path('blog/<slug:slug>/', views.blog, name='blog')
]