import copy

from django.core.management.base import BaseCommand, CommandError
from tournament.models import Tournament, TournamentPlay
from tournament.logic import get_scheme
from tournament.brackets import resolve_r32_fixtures


class Command(BaseCommand):
    help = (
        "Resolve R32 placeholder slots (1A, 2B, 3A/B/C/D/F, ...) into real teams "
        "from the seeded group results, and write them into the master format and "
        "every existing play's bracket so users see the real fixtures."
    )

    def add_arguments(self, parser):
        parser.add_argument('slug', type=str, help='Tournament slug, e.g. world-cup-2026')
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print the resolved R32 fixtures without saving anything',
        )

    def handle(self, *args, **options):
        slug = options['slug']
        dry_run = options['dry_run']

        try:
            tournament = Tournament.objects.select_related('format').get(slug=slug)
        except Tournament.DoesNotExist:
            raise CommandError(f'Tournament "{slug}" not found.')

        fmt = tournament.format
        if not fmt.groups_results:
            raise CommandError('groups_results is empty — seed/finalize the group stage first.')

        scheme = get_scheme(slug)
        allocation = getattr(scheme, 'THIRD_PLACE_ALLOCATION', {})
        skeleton = fmt.bracket_stage or scheme.BRACKET_SKELETON

        try:
            resolved_r32 = resolve_r32_fixtures(fmt.groups_results, skeleton, allocation)
        except ValueError as e:
            raise CommandError(str(e))

        for m in resolved_r32:
            self.stdout.write(f"  [{m['id']}] {m['home']['name']} vs {m['away']['name']}")

        if dry_run:
            self.stdout.write(self.style.SUCCESS(
                f'Dry run — {len(resolved_r32)} R32 fixtures resolved, nothing saved.'
            ))
            return

        # 1. Master format: replace R32 with resolved fixtures (keeps R16+ topology).
        bracket_stage = copy.deepcopy(fmt.bracket_stage or scheme.BRACKET_SKELETON)
        bracket_stage['R32'] = resolved_r32
        fmt.bracket_stage = bracket_stage
        fmt.save(update_fields=['bracket_stage', 'last_updated'])

        # 2. Every play: overwrite each R32 match's home/away in-place, preserving
        #    any winner picks and all later rounds. Plays missing an R32 get the
        #    full master bracket.
        resolved_by_id = {m['id']: m for m in resolved_r32}
        plays = TournamentPlay.objects.filter(tournament=tournament)
        updated = 0
        for play in plays:
            bp = play.bracket_predictions or {}
            r32 = bp.get('R32')
            if not r32:
                bp = copy.deepcopy(bracket_stage)
            else:
                for match in r32:
                    src = resolved_by_id.get(match.get('id'))
                    if src:
                        match['home'] = copy.deepcopy(src['home'])
                        match['away'] = copy.deepcopy(src['away'])
            play.bracket_predictions = bp
            play.save(update_fields=['bracket_predictions'])
            updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'R32 resolved -> master format + {updated} play(s) for "{tournament.name}".'
        ))
