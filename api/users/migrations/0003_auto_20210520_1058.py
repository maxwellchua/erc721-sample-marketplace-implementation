# Generated by Django 3.2.3 on 2021-05-20 10:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_rename_token_user_wallet_token'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='instagram',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
        migrations.AddField(
            model_name='user',
            name='messenger',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
        migrations.AddField(
            model_name='user',
            name='twitter',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
    ]
