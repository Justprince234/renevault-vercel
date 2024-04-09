from django.db import models
from  django.conf import settings
from django.core.validators import MinLengthValidator

import uuid


# Create your models here.
class InternationalTransfer(models.Model):
    """User transactions table"""
    to_fullname = models.CharField(max_length=200)
    bank_name = models.CharField(max_length=100)
    bank_country = models.CharField(max_length=100)
    to_account = models.CharField(max_length=150)
    routing_number = models.CharField(max_length=100)
    iban_number = models.CharField(max_length=100)
    transfer_amount = models.DecimalField(default=0, max_digits=12, decimal_places=2)
    currency_type = models.CharField(default='USD', max_length=20)
    transaction_pin = models.IntegerField(validators=[MinLengthValidator(4)])
    transfer_description = models.CharField(max_length=100, null=True, blank=True)
    transfer_date = models.DateTimeField(auto_now_add=True)
    transaction_id = models.UUIDField(unique=True, editable=False, default=uuid.uuid4)
    owner= models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sender', on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = 'International Tranfers'

    def __str__(self):
        return "The sum of {} has been paid to {}".format(self.transfer_amount, self.to_account)

class LocalTransfer(models.Model):
    """User Transfer table"""
    to_fullname = models.CharField(max_length=200)
    bank_name = models.CharField(max_length=100)
    to_account = models.CharField(max_length=150)
    transfer_amount = models.DecimalField(default=0, max_digits=12, decimal_places=2)
    transaction_pin = models.IntegerField(validators=[MinLengthValidator(4)])
    transfer_description = models.CharField(max_length=100, null=True, blank=True)
    transfer_date = models.DateTimeField(auto_now_add=True)
    transaction_id = models.UUIDField(unique=True, editable=False, default=uuid.uuid4)
    owner= models.ForeignKey(settings.AUTH_USER_MODEL, related_name='senders', on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = 'Local Tranfers'

    def __str__(self):
        return "The sum of {} has been paid to {}".format(self.transfer_amount, self.to_account)
