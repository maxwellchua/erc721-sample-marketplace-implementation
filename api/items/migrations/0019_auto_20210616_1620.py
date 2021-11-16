# Generated by Django 3.2.4 on 2021-06-16 16:20

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import items.validators


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0018_auto_20210615_1525'),
    ]

    operations = [
        migrations.AlterField(
            model_name='auction',
            name='start_date',
            field=models.DateTimeField(validators=[items.validators.validate_auction_start_date]),
        ),
        migrations.AlterField(
            model_name='auction',
            name='starting_bidding_price',
            field=models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(0)]),
        ),
        migrations.AlterField(
            model_name='item',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='items.category'),
        ),
    ]
