from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0005_tournamentpool_payout_config'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentpool',
            name='currency',
            field=models.CharField(blank=True, default='€', max_length=3),
        ),
    ]
