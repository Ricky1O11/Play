# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2017-02-16 16:02
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0004_matches_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='matches',
            name='time',
            field=models.DateTimeField(blank=True, default=django.utils.timezone.now),
        ),
    ]
