from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0009_tournamentplay_group_points_spent'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournament',
            name='entries_close',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
