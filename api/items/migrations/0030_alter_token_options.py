# Generated by Django 3.2.4 on 2021-07-20 09:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0029_item_is_super_featured'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='token',
            options={'ordering': ['collectible', 'owner']},
        ),
    ]
