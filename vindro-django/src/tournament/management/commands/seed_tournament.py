from django.core.management.base import BaseCommand
from datetime import datetime, timezone as dt_timezone
from tournament.models import Tournament, TournamentFormat
from tournament.logic import seed_master_format


class Command(BaseCommand):
    help = 'Create or update a tournament from its preset, then seed its format'

    def add_arguments(self, parser):
        parser.add_argument('slug', type=str, help='Tournament slug, e.g. world-cup-2026')

    def handle(self, *args, **options):
        slug = options['slug']

        PRESETS = {
            'world-cup-2026': {
                'name': 'World Cup 2026',
                'tournament_type': 'world_cup',
                'status': 'open',
                'description': 'FIFA World Cup 2026 — United States, Canada & Mexico',
                'image_url': '',
                # Tournament window
                'start_date':          datetime(2026, 6, 11, 21, 0, tzinfo=dt_timezone.utc),
                'entries_close':       datetime(2026, 6, 10, 21, 0, tzinfo=dt_timezone.utc),
                'groups_end_date':     datetime(2026, 6, 27,  6, 0, tzinfo=dt_timezone.utc),
                'bracket_start_date':  datetime(2026, 6, 28, 21, 0, tzinfo=dt_timezone.utc),
                'end_date':            datetime(2026, 7, 19,  6, 0, tzinfo=dt_timezone.utc),
                # Card display info
                'card_info': {
                    'subtitle': 'Two Stage Event',
                    'group_stage': {
                        'teams': 48,
                        'max_points': 50,
                        'description': 'Predict the placement of each team within their 4-team group',
                    },
                    'bracket_stage': {
                        'teams': 32,
                        'opening_round': 'Round of 32',
                        'description': 'Predict how teams advance through the knockout bracket',
                    },
                },
            },
        }

        if slug not in PRESETS:
            self.stderr.write(self.style.ERROR(
                f'No preset for "{slug}". Available: {list(PRESETS.keys())}'
            ))
            return

        preset = PRESETS[slug]
        tournament, created = Tournament.objects.update_or_create(
            slug=slug,
            defaults=preset,
        )

        action = 'Created' if created else 'Updated'
        self.stdout.write(f'{action} tournament: {tournament.name}')

        TournamentFormat.objects.get_or_create(tournament=tournament)
        seed_master_format(tournament)
        TournamentFormat.objects.filter(tournament=tournament).update(is_seeded=True)

        self.stdout.write(self.style.SUCCESS(f'Seeded: {tournament.name} [{slug}]'))
