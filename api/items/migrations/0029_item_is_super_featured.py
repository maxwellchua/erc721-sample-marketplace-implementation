# Generated by Django 3.2.4 on 2021-07-20 06:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0028_rename_token_id_item_item_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='is_super_featured',
            field=models.BooleanField(default=False),
        ),
    ]
