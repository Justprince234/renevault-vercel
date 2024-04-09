from django.shortcuts import render
from .models import InternationalTransfer, LocalTransfer

# Create your views here.


def international_transfer(request):
    """Displays the payment page."""
    template_name = 'payment.html'
    if request.method == 'POST':
        to_account = request.POST['to_account']
        to_fullname = request.POST['to_fullname']
        bank_name = request.POST['bank_name']
        bank_country = request.POST['bank_country']
        routing_number = request.POST['routing_number']
        iban_number = request.POST['iban_number']
        transfer_amount = request.POST['transfer_amount']
        currency_type = request.POST['currency_type']
        transfer_description = request.POST['transfer_description']
        transaction_pin = request.POST['transaction_pin']
        currency_type = request.POST['currency_type']
    return render(request, template_name)