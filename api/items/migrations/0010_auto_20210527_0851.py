# Generated by Django 3.2.3 on 2021-05-27 08:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('items', '0009_alter_item_seller'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='item',
            name='seller',
        ),
        migrations.AddField(
            model_name='item',
            name='creator',
            field=models.ForeignKey(default=5, on_delete=django.db.models.deletion.CASCADE, related_name='create_set', to='users.user'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='item',
            name='owner',
            field=models.ForeignKey(default=5, on_delete=django.db.models.deletion.CASCADE, related_name='own_set', to='users.user'),
            preserve_default=False,
        ),
    ]