from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0011_tournament_card_info'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='status',
            field=models.CharField(
                choices=[
                    ('upcoming', 'Upcoming'),
                    ('open', 'Open'),
                    ('in_play', 'In Play'),
                    ('closed', 'Closed'),
                ],
                default='upcoming',
                max_length=20,
            ),
        ),
    ]
