# Generated by Django 3.2.3 on 2021-06-08 07:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0016_auto_20210608_0746'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='contract_address',
            field=models.CharField(max_length=64, unique=True),
        ),
    ]