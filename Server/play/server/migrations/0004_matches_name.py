# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2017-01-21 14:32
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0003_auto_20170104_2108'),
    ]

    operations = [
        migrations.AddField(
            model_name='matches',
            name='name',
            field=models.CharField(default='', max_length=256),
        ),
    ]
