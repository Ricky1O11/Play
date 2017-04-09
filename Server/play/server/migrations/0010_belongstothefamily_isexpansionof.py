# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-09 11:44
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0009_auto_20170408_1745'),
    ]

    operations = [
        migrations.CreateModel(
            name='BelongsToTheFamily',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('boardgame1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='boardgameI1', to='server.Boardgames')),
                ('boardgame2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='boardgameI2', to='server.Boardgames')),
            ],
        ),
        migrations.CreateModel(
            name='IsExpansionOf',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('boardgame1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='boardgameE1', to='server.Boardgames')),
                ('boardgame2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='boardgameE2', to='server.Boardgames')),
            ],
        ),
    ]
