from django.core.management.base import BaseCommand
from datetime import datetime, timezone as dt_timezone
from tournament.models import Tournament, TournamentFormat, TournamentPool
from tournament.logic import seed_master_format


class Command(BaseCommand):
    help = 'Create and seed a tournament from its scheme file'

    def add_arguments(self, parser):
        parser.add_argument('slug', type=str, help='Tournament slug, e.g. world-cup-2026')

    def handle(self, *args, **options):
        slug = options['slug']

        PRESETS = {
            'world-cup-2026': {
                'name': 'World Cup 2026',
                'tournament_type': 'world_cup',
                'description': 'FIFA World Cup 2026',
                'start_date': datetime(2026, 6, 11, tzinfo=dt_timezone.utc),
                'end_date': datetime(2026, 7, 19, tzinfo=dt_timezone.utc),
                'groups_end_date': datetime(2026, 7, 2, tzinfo=dt_timezone.utc),
                'bracket_start_date': datetime(2026, 7, 4, tzinfo=dt_timezone.utc),
            },
        }

        if slug not in PRESETS:
            self.stderr.write(self.style.ERROR(f'No preset found for "{slug}". Available: {list(PRESETS.keys())}'))
            return

        tournament, created = Tournament.objects.get_or_create(
            slug=slug,
            defaults=PRESETS[slug],
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Tournament "{tournament.name}" created.'))
        else:
            self.stdout.write(f'Tournament "{tournament.name}" already exists, re-seeding format.')

        fmt, _ = TournamentFormat.objects.get_or_create(tournament=tournament)
        seed_master_format(tournament)
        fmt.refresh_from_db()
        fmt.is_seeded = True
        fmt.save()

        public_pool, pool_created = TournamentPool.objects.get_or_create(
            tournament=tournament,
            is_public=True,
            defaults={
                'name': 'vindroPublic',
                'description': 'The official vindroGames public pool. Everyone can join!',
                'created_by': None,
                'allow_multiple_plays_per_user': True,
            }
        )
        if pool_created:
            self.stdout.write(self.style.SUCCESS(f'Public pool "{public_pool.name}" created.'))
        else:
            self.stdout.write(f'Public pool "{public_pool.name}" already exists.')

        self.stdout.write(self.style.SUCCESS(f'Seeded: {tournament.name} [{slug}]'))
