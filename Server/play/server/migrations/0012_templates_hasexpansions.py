# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-21 14:34
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0011_playedexpansions'),
    ]

    operations = [
        migrations.AddField(
            model_name='templates',
            name='hasExpansions',
            field=models.BooleanField(default=False),
        ),
    ]