# Generated by Django 4.1.2 on 2024-03-25 11:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0022_user_paul_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
