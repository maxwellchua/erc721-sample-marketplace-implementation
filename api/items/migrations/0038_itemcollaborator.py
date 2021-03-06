# Generated by Django 3.2.4 on 2021-08-18 09:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('items', '0037_alter_item_royalties'),
    ]

    operations = [
        migrations.CreateModel(
            name='ItemCollaborator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('wallet_token', models.CharField(blank=True, default='', max_length=64)),
                ('share_percentage', models.DecimalField(decimal_places=2, max_digits=5)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='collaborators', to='items.item')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='collaborated_items', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
