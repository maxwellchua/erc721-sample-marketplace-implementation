# Generated by Django 3.2.4 on 2021-07-21 06:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0030_alter_token_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='token',
            options={'ordering': ['collectible', 'owner', 'token_number']},
        ),
        migrations.AlterField(
            model_name='token',
            name='token_number',
            field=models.PositiveIntegerField(default=1),
        ),
    ]