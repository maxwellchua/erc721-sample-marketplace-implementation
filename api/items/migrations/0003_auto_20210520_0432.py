# Generated by Django 3.2.3 on 2021-05-20 04:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0002_auto_20210520_0426'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='item',
            name='profile_image',
        ),
        migrations.AddField(
            model_name='item',
            name='category',
            field=models.CharField(choices=[('hiphop_rap', 'Hip Hop/Rap'), ('techno', 'Techno'), ('rnb', 'R&B'), ('punk', 'Punk'), ('country', 'Country'), ('indie_rock', 'Indie Rock'), ('electro', 'Electro'), ('latin', 'Latin'), ('other', 'Other')], default='Other', max_length=16),
        ),
    ]
