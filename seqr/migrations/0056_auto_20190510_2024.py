# -*- coding: utf-8 -*-
# Generated by Django 1.11.20 on 2019-05-10 20:24
from __future__ import unicode_literals

from django.db import migrations, models
from django.contrib.postgres.aggregates import ArrayAgg


def remove_duplicate_results(apps, schema_editor):
    # We get the model from the versioned app registry;
    # if we directly import it, it'll be the wrong version
    # see https://docs.djangoproject.com/en/1.11/ref/migration-operations/#django.db.migrations.operations.RunPython
    VariantSearchResults = apps.get_model("seqr", "VariantSearchResults")
    db_alias = schema_editor.connection.alias
    duplicate_agg = VariantSearchResults.objects.using(db_alias).values('search_hash')\
            .annotate(sorts=ArrayAgg('sort'))\
            .annotate(c=models.Func('sorts', models.Value(1), function='array_length')).filter(c__gt=1)
    for dup_searches in duplicate_agg:
        for i, sort in enumerate(dup_searches['sorts'][1:]):
            result = VariantSearchResults.objects.using(db_alias).get(search_hash=dup_searches['search_hash'], sort=sort)
            result.search_hash = '{}_{}'.format(result.search_hash, i)
            result.save()


class Migration(migrations.Migration):

    dependencies = [
        ('seqr', '0055_remove_sample_dataset_name'),
    ]

    operations = [
        migrations.RunPython(remove_duplicate_results, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='variantsearchresults',
            name='search_hash',
            field=models.CharField(db_index=True, max_length=50, unique=True),
        ),
        migrations.AlterUniqueTogether(
            name='variantsearchresults',
            unique_together=set([]),
        ),
        migrations.RemoveField(
            model_name='variantsearchresults',
            name='results',
        ),
        migrations.RemoveField(
            model_name='variantsearchresults',
            name='sort',
        ),
    ]
