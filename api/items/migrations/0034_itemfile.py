# Generated by Django 3.2.4 on 2021-08-16 07:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0033_alter_token_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='ItemFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(blank=True, default='', upload_to='items/file2/')),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='items.item')),
            ],
        ),
    ]
