from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0010_tournament_entries_close'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournament',
            name='card_info',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
