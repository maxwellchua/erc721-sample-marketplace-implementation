# Generated by Django 3.2.4 on 2021-09-23 06:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0039_auto_20210818_0935'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='is_360_video',
            field=models.BooleanField(default=False),
        ),
    ]