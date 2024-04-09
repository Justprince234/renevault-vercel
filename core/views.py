from django.shortcuts import render, get_object_or_404, redirect
from account.models import User, UpdateUser
from .models import History, Contact, Blog
from transaction.models import InternationalTransfer, LocalTransfer
from django.contrib.auth import get_user_model
from django.core.files.storage import FileSystemStorage
from django.contrib import messages
from django.core.exceptions import ObjectDoesNotExist
from django.db import DataError
from django.contrib.auth.models import auth
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from .tokens import account_activation_token
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

# Create your views here.
def home(request):
    """Displays the index page."""
    template_name = 'index.html'
    blog = Blog.objects.all()
    return render(request, template_name, {'blogs': blog})

def registration(request):
    """Displays the account application page."""
    template_name = 'account-application.html'
    if request.method == 'POST':
        first_name = request.POST['first_name']
        middle_name = request.POST['middle_name']
        surname = request.POST['surname']
        username = request.POST['username']
        email = request.POST['email']
        date_of_birth = request.POST['date_of_birth']
        phone = request.POST['phone']
        address = request.POST['address']
        gender = request.POST.get('gender', 'None')
        security_question = request.POST.get('security_question')
        security_answer = request.POST.get("security_answer", "None")
        password = request.POST['password']

        if User.objects.filter(email=email).exists():
            messages.info(request, 'email already exist.')
            return redirect('core:registration')
        elif User.objects.filter(username=username).exists():
            messages.info(request, 'user already exist.')
            return redirect('core:registration')  
        user = User.objects.create_user(first_name=first_name, middle_name=middle_name, surname=surname, username=username,date_of_birth=date_of_birth, email=email, phone=phone, address=address, gender=gender, security_question=security_question, security_answer=security_answer, password=password)
        user.is_active = True  
        user.save()
        # current_site = get_current_site(request)
        # message = render_to_string('get-otp.html', {
        #     'user': user,
        #     'domain':current_site.domain,
        #     'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        #     'token': account_activation_token.make_token(user),
        # })
        # mail_subject = 'Mbreybn Access Bank E-mail verification'
        # recipient_list = user.email
        # from_email = 'oilsunny@gmail.com'
        # send_mail(mail_subject, str(message), from_email, [str(recipient_list)], fail_silently=False)
        # messages.success(request, f'Dear {user.first_name}, please check your email "{user.email}" inbox and click on \
        #     received activation link to confirm and complete the registration. Note: Check your spam folder.')  
        return redirect('core:login')
    return render(request, template_name)

def login(request):
    """Displays the account login page."""
    template_name = 'account-login.html'
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect('core:dashboard')
        messages.info(request, 'Invalid Credentials.')
        return redirect('core:login')
    return render(request, template_name)

def logout(request):
    """Returns the logout page, redirecting to the home page."""
    auth.logout(request)
    return redirect('core:home')

def activate(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()

        messages.success(request, 'Thank you for your email confirmation. Now you can login your account.')
        return redirect('core:login')
    else:
        messages.error(request, 'Activation link is invalid!')
    
    return redirect('core:home')

@login_required
def dashboard(request):
    template_name = "dash.html"
    user = request.user
    updates = UpdateUser.objects.filter(user=user)
    histories = History.objects.filter(user=user).order_by('-date')
    context = {'updates': updates, 'histories': histories} 
    return render(request, template_name, context)

@login_required
def history(request):
    template_name = "TransactionHistory.html"
    user = request.user
    updates = UpdateUser.objects.filter(user=user)
    histories = History.objects.filter(user=user).order_by('-date')
    context = {'histories': histories, 'updates': updates} 
    return render(request, template_name, context)

@login_required
def updated_profile(request):
    template_name = "NoTransactionHistory.html"
    user = request.user
    updates = UpdateUser.objects.filter(user=user)
    context = {'updates': updates} 
    return render(request, template_name, context)

@login_required
def international(request):
    user =request.user
    updates = UpdateUser.objects.get(user=user).user.status
    current_pin = UpdateUser.objects.get(user=user).transaction_pin
    update_user = UpdateUser.objects.filter(user=user)
    available_balance =UpdateUser.objects.get(user=user).available_balance
    try:
        if request.method == 'POST':
            to_fullname= request.POST['to_fullname']
            bank_name = request.POST['bank_name']
            bank_country = request.POST['bank_country']
            to_account = request.POST['to_account']
            routing_number = request.POST['routing_number']
            iban_number = request.POST['iban_number']
            transfer_amount = request.POST['transfer_amount']
            currency_type = request.POST['currency_type']
            transfer_description = request.POST['transfer_description']
            transaction_pin = request.POST['transaction_pin']
            if updates == 'Active':
                if int(current_pin) == int(transaction_pin):
                    available_balance -= int(transfer_amount)
                    update_user.update(available_balance=available_balance)
                    international = InternationalTransfer(to_fullname=to_fullname, bank_name=bank_name, bank_country=bank_country, to_account=to_account, routing_number=routing_number, iban_number=iban_number, transfer_amount=transfer_amount, currency_type=currency_type, transfer_description=transfer_description, transaction_pin=transaction_pin)
                    international.owner = request.user
                    international.save()
                    messages.success(request, 'Sent!')
                    return redirect('core:payment')
                messages.error(request, 'Invalid transaction pin!')
                return redirect('core:payment')
            messages.error(request, 'Account not active, Please contact support. Thanks!') 
            messages.error(request, 'Invalid transaction')
            return redirect('core:payment')
        return redirect('core:payment')
    except (ValueError, TypeError, DataError) as e:
        messages.error(request, e)
        return redirect('core:payment')


@login_required
def local(request):
    user =request.user
    updates = UpdateUser.objects.get(user=user).user.status
    current_pin = UpdateUser.objects.get(user=user).transaction_pin
    update_user = UpdateUser.objects.filter(user=user)
    available_balance =UpdateUser.objects.get(user=user).available_balance
    try:
        if request.method == 'POST':
            to_fullname= request.POST['to_fullname']
            bank_name = request.POST['bank_name']
            to_account = request.POST['to_account']
            transfer_amount = request.POST['transfer_amount']
            transfer_description = request.POST['transfer_description']
            transaction_pin = request.POST['transaction_pin']
            if updates == 'Active':
                if int(current_pin) == int(transaction_pin):
                    available_balance -= int(transfer_amount)
                    update_user.update(available_balance=available_balance)
                    local = LocalTransfer(to_fullname=to_fullname, bank_name=bank_name, to_account=to_account, transfer_amount=transfer_amount, transfer_description=transfer_description, transaction_pin=transaction_pin)
                    local.owner = request.user
                    local.save()
                    messages.success(request, 'Sent!')
                    return redirect('core:payment')
                messages.error(request, 'Invalid transaction pin!')
                return redirect('core:payment')
            messages.error(request, 'Account not active, Please contact support. Thanks!') 
            return redirect('core:payment')
        return redirect('core:payment')
    except (ValueError, TypeError, DataError) as e:
        messages.error(request, e)
        return redirect('core:payment')

@login_required
def payment(request):
    """Displays the account login page."""
    user = request.user
    updates = UpdateUser.objects.get_or_create(user=user)
    template_name = 'payment.html'
    return render(request, template_name, {'updates':updates})

@login_required   
def profile(request):
    """Displays the account login page."""
    template_name = 'profile.html'
    user = request.user
    updates = UpdateUser.objects.filter(user=user)
    if request.method == 'POST' and request.FILES['passport']:
        passport = request.FILES['passport']
        fs = FileSystemStorage()
        file = fs.save(passport.name, passport)
        file_url = fs.url(file)
        transaction_pin = request.POST['transaction_pin']
        confirm_transaction_pin = request.POST['confirm_transaction_pin']
        if transaction_pin == confirm_transaction_pin:
            updated = UpdateUser(passport=file, transaction_pin=transaction_pin, confirm_transaction_pin=confirm_transaction_pin)
            updated.user = request.user
            updated.save()
            messages.info(request, 'Congratulations, Data updated!')
            return render(request, template_name, {'file_url': file_url})
        messages.info(request, 'Transaction pin does not match')
        return redirect('core:profile')
    return render(request, template_name, {'updates': updates})

@login_required
def change_password(request):
    """change password."""
    
    return render(request)

@login_required
def success(request):
    """Displays the account login page."""
    template_name = 'successpage.html'
    return render(request, template_name)

def contact_us(request):
    """Displays the account login page."""
    template_name = 'contact-us.html'
    blog = Blog.objects.all()
    if request.method == 'POST':
        full_name= request.POST['full_name']
        email = request.POST['email']
        message = request.POST['message']
        contact = Contact(full_name=full_name, email=email, message=message)
        contact.save()
        messages.info(request, 'Sent! One of our agent will contact you soon')
    return render(request, template_name, {'blogs': blog})

def aboutUs(request):
    """Displays the account login page."""
    template_name = 'about-us.html'
    return render(request, template_name)

def our_products(request):
    """Displays the account login page."""
    template_name = 'our-products.html'
    return render(request, template_name)

def helpful_forms(request):
    """Displays the helpful forms page."""
    template_name = 'helpful-forms.html'
    return render(request, template_name)

def blog(request, slug):
    """Displays the blog page."""
    template_name = 'blog.html'
    return render(request, template_name, {'blogs': get_object_or_404(Blog, slug=slug)})