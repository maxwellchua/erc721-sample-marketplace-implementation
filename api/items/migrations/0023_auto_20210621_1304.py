# Generated by Django 3.2.4 on 2021-06-21 13:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0022_auto_20210621_1138'),
    ]

    operations = [
        migrations.RenameField(
            model_name='item',
            old_name='isFeatured',
            new_name='is_featured',
        ),
        migrations.RenameField(
            model_name='item',
            old_name='isTopSeller',
            new_name='is_topseller',
        ),
    ]