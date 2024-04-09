from django.db import models
from  account.models import User
from django.urls import reverse

import uuid

# Create your models here.
TRANSACTION_TYPE = (
    ('Debit', 'Debit'), 
    ('Credit', 'Credit') 
)

class History(models.Model):
    user =  models.ForeignKey(User, related_name='history', on_delete=models.CASCADE) 
    sender_name = models.CharField(max_length=100, default="")
    account_number = models.CharField(max_length=100)
    description = models.CharField(max_length=100, default="")
    receiver_name = models.CharField(max_length=100, default="")
    receiver_bank = models.CharField(max_length=100, default="")
    transaction_type = models.CharField(choices=TRANSACTION_TYPE, default="Debit", max_length=10)
    amount = models.IntegerField()
    transaction_reference = models.UUIDField(unique=True, editable=False, default=uuid.uuid4)
    date = models.DateField()

    class Meta:
        verbose_name_plural = "Histories"

class Contact(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()

class Blog(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    date = models.DateField()
    message = models.TextField()

    def get_absolute_url(self):
        return reverse('core:blog', args=[self.slug])