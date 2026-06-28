from django.core.management.base import BaseCommand, CommandError
from tournament.models import Tournament
from tournament.logic import get_scheme


class Command(BaseCommand):
    help = "Write the final group-stage standings (GROUPS_RESULTS) into the tournament format."

    def add_arguments(self, parser):
        parser.add_argument('slug', type=str, help='Tournament slug, e.g. world-cup-2026')
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print the results that would be written without saving anything',
        )

    def handle(self, *args, **options):
        slug = options['slug']
        dry_run = options['dry_run']

        try:
            tournament = Tournament.objects.select_related('format').get(slug=slug)
        except Tournament.DoesNotExist:
            raise CommandError(f'Tournament "{slug}" not found.')

        try:
            fmt = tournament.format
        except Exception:
            raise CommandError('Tournament has no format record. Run seed_tournament first.')

        try:
            scheme = get_scheme(slug)
        except ModuleNotFoundError:
            raise CommandError(f'No scheme module for "{slug}".')

        if not hasattr(scheme, 'GROUPS_RESULTS'):
            raise CommandError(f'Scheme for "{slug}" has no GROUPS_RESULTS defined.')

        results = scheme.GROUPS_RESULTS

        for group_name, teams in results.items():
            placements = ', '.join(f'{i + 1}. {t["team"]}' for i, t in enumerate(teams))
            self.stdout.write(f'  {group_name}: {placements}')

        if dry_run:
            self.stdout.write(self.style.SUCCESS(
                f'Dry run — {len(results)} groups would be written to "{tournament.name}".'
            ))
            return

        fmt.groups_results = results
        fmt.save(update_fields=['groups_results', 'last_updated'])
        self.stdout.write(self.style.SUCCESS(
            f'Group results seeded for "{tournament.name}" ({len(results)} groups).'
        ))
