# Generated by Django 4.1.2 on 2022-11-24 18:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0011_alter_updateuser_confirm_transaction_pin_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='updateuser',
            name='passport',
            field=models.ImageField(blank=True, null=True, upload_to='photos/%Y/%m/%d/'),
        ),
    ]