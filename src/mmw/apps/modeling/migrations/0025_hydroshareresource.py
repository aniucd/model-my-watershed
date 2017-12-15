# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('modeling', '0024_fix_gwlfe_gis_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='HydroShareResource',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('resource', models.UUIDField(help_text='ID of Resource in HydroShare')),
                ('title', models.CharField(help_text='Title of Resource in HydroShare', max_length=255)),
                ('url', models.CharField(help_text='URL of Resource in HydroShare', max_length=1023)),
                ('autosync', models.BooleanField(default=False, help_text='Whether to automatically push changes to HydroShare')),
                ('exported_at', models.DateTimeField(help_text='Most recent export date')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('modified_at', models.DateTimeField(auto_now=True)),
                ('project', models.OneToOneField(related_name='hydroshare', to='modeling.Project')),
            ],
        ),
    ]
