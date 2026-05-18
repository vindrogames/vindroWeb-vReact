from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0008_remove_current_member_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentplay',
            name='group_points_spent',
            field=models.IntegerField(default=0),
        ),
    ]
