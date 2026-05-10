from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0007_slug_fields'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournamentpool',
            name='current_member_count',
        ),
    ]
