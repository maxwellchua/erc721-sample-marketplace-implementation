# Generated by Django 3.2.4 on 2021-06-25 05:35

from django.db import migrations
import items.fields


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0024_merge_0023_auto_20210621_1304_0023_auto_20210622_0740'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='contract_address',
            field=items.fields.NullableCharField(blank=True, default=None, max_length=64, null=True, unique=True),
        ),
    ]
