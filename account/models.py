from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from  django.conf import settings
from django.contrib.auth.validators import UnicodeUsernameValidator

from django.core.validators import MinLengthValidator
from datetime import timedelta


import random

def return_date_time():
    now = timezone.now()
    return now + timedelta(days=1)

QUESTION_TYPE = (
    ('What Is your favorite book?', 'What Is your favorite book?'),
    ('What is your mother’s maiden name?', 'What is your mother’s maiden name?'),
    ('What is your favorite food?', 'What is your favorite food?'),
    ('What city were you born in?', 'What city were you born in?'),
    ('Where is your favorite place to vacation?', 'Where is your favorite place to vacation?'),
    ('What was the first company that you worked for?', 'What was the first company that you worked for?'),
)

SEX = (
    ('G', 'Gender'),
    ('M', 'Male'),
    ('F', 'Female'),
)

STATUS = (
    ('Active', 'Active'),
    ('Dormant', 'Dormant'),
    ('Deactivated','Deactivated')
)

# Create your models here.
class UserManager(BaseUserManager):
    
    def _create_user(self,username, email, password, is_staff, is_superuser, **extra_fields):
        if not username:
            raise ValueError("Username must be set")
        if not email:
            raise ValueError('Users must have an email address')
        now = timezone.now()
        email = self.normalize_email(email)
        user = self.model(
            username=username,
            email=email,
            is_staff=is_staff,
            is_superuser=is_superuser,
            is_active=True,
            date_joined=now,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username=None, email=None, password=None, **extra_fields):
        return self._create_user(username, email, password, False, False, **extra_fields)

    def create_superuser(self, username, email, password, **extra_fields):
        user = self._create_user(username, email, password, True, True, **extra_fields) 
        user.save(using=self._db)
        return user

def random_account():
    return str(random.randint(1000000000, 10000000000))

class User(AbstractBaseUser, PermissionsMixin):

    """Custom user class inheriting AbstractBaseUser class."""
    
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    username = models.CharField(max_length=150, validators=[UnicodeUsernameValidator, ],unique=True)
    email = models.EmailField(max_length=150, unique=True)
    date_of_birth = models.DateField(default=return_date_time)
    gender = models.CharField(choices=SEX,default="G", max_length=10)
    phone = models.CharField(max_length=100)
    address = models.CharField(max_length=150, default="")
    security_question = models.CharField(choices=QUESTION_TYPE, default="Active", max_length=300)
    security_answer = models.CharField(max_length=200)
    account_number = models.CharField(default=random_account, unique=True, max_length=200)
    scheduled_balance = models.DecimalField(default=0, max_digits=50, decimal_places=2)
    expenses_balance = models.DecimalField(default=0, max_digits=50, decimal_places=2)
    paul_date = models.DateField(default=return_date_time)
    status = models.CharField(choices=STATUS, default="Active", max_length=20)
    date_joined = models.DateTimeField(verbose_name='date joined', auto_now_add=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", ]

    def get_absolute_url(self):
        return "/users/%i/" % (self.pk)

    def get_email(self):
        return self.email

class UpdateUser(models.Model):
    """Update user credentials"""
    user = models.OneToOneField(User, related_name='owner', on_delete=models.CASCADE) 
    passport = models.ImageField(upload_to='photos/%Y/%m/%d/', blank=True, null=True)
    available_balance = models.DecimalField(default=0, max_digits=50, decimal_places=2)
    transaction_pin = models.IntegerField(default=000) 
    confirm_transaction_pin = models.IntegerField(default=000)
    date_updated = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "User Profile Update"
  
    def __str__(self):
        return "{}".format(self.user)