# -*- coding: utf-8 -*-
# Generated by Django 1.11.20 on 2019-05-10 20:24
from __future__ import unicode_literals

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reference_data', '0013_auto_20190404_1953'),
    ]

    operations = [
        migrations.AlterField(
            model_name='geneexpression',
            name='expression_values',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.FloatField(), size=None),
        ),
    ]
