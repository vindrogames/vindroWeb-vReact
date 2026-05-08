from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0004_tournamentpool_join_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentpool',
            name='payout_config',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
