import re
from django.db import migrations, models


def _to_slug(name):
    return re.sub(r'\s+', '-', (name or '').strip().lower())


def populate_slugs(apps, schema_editor):
    TournamentPool = apps.get_model('tournament', 'TournamentPool')
    TournamentPlay = apps.get_model('tournament', 'TournamentPlay')

    for pool in TournamentPool.objects.all():
        pool.slug = _to_slug(pool.name)
        pool.save(update_fields=['slug'])

    for play in TournamentPlay.objects.all():
        play.slug = _to_slug(play.name)
        play.save(update_fields=['slug'])


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0006_tournamentpool_currency'),
    ]

    operations = [
        # Add slug to TournamentPool (no unique yet — populate first)
        migrations.AddField(
            model_name='tournamentpool',
            name='slug',
            field=models.SlugField(max_length=28, blank=True, default=''),
        ),
        # Add slug to TournamentPlay
        migrations.AddField(
            model_name='tournamentplay',
            name='slug',
            field=models.CharField(max_length=28, blank=True, default=''),
        ),
        # Populate slugs from existing names
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
        # Now add unique constraint on pool slug
        migrations.AlterField(
            model_name='tournamentpool',
            name='slug',
            field=models.SlugField(max_length=28, unique=True, blank=True, default=''),
        ),
        # Add unique_together constraint on play slug
        migrations.AddConstraint(
            model_name='tournamentplay',
            constraint=models.UniqueConstraint(
                fields=['user', 'tournament', 'slug'],
                name='unique_play_slug_per_user_per_tournament',
            ),
        ),
    ]
