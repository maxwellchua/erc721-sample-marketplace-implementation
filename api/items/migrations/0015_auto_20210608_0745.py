# Generated by Django 3.2.3 on 2021-06-08 07:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0014_auto_20210527_1022'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='item',
            name='type',
        ),
        migrations.AddField(
            model_name='item',
            name='contract_address',
            field=models.CharField(blank=True, default='', max_length=64),
        ),
    ]
