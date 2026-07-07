from django.core.management.base import BaseCommand, CommandError
from tournament.models import Tournament, TournamentPlay
from tournament.scoring import score_bracket_stage


class Command(BaseCommand):
    help = 'Seed bracket results for completed rounds and score all plays.'

    def add_arguments(self, parser):
        parser.add_argument('slug', type=str, help='Tournament slug')
        parser.add_argument(
            '--rounds',
            type=str,
            default='R32,R16',
            help='Comma-separated list of rounds to include (e.g., "R32,R16,QF")',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print scores without saving anything',
        )

    def handle(self, *args, **options):
        slug = options['slug']
        dry_run = options['dry_run']
        rounds_to_include = [r.strip() for r in options['rounds'].split(',')]

        try:
            tournament = Tournament.objects.select_related('format').get(slug=slug)
        except Tournament.DoesNotExist:
            raise CommandError(f'Tournament "{slug}" not found.')

        try:
            tournament_format = tournament.format
        except Exception:
            raise CommandError('Tournament has no format record.')

        # Import the results from the scheme
        from tournament.schemes.world_cup_2026 import (
            BRACKET_RESULTS_R32_WINNERS,
            BRACKET_RESULTS_R16_WINNERS,
        )

        # Build the bracket_results structure with all requested rounds
        bracket_results = {}
        total_matches = 0

        if 'R32' in rounds_to_include:
            bracket_results['R32'] = [
                {"id": match_id, "winner": winner}
                for match_id, winner in BRACKET_RESULTS_R32_WINNERS.items()
            ]
            total_matches += len(BRACKET_RESULTS_R32_WINNERS)

        if 'R16' in rounds_to_include:
            bracket_results['R16'] = [
                {"id": match_id, "winner": winner}
                for match_id, winner in BRACKET_RESULTS_R16_WINNERS.items()
            ]
            total_matches += len(BRACKET_RESULTS_R16_WINNERS)

        # TODO: Add QF, SF, 3rd, F when those rounds complete
        # if 'QF' in rounds_to_include:
        #     from tournament.schemes.world_cup_2026 import BRACKET_RESULTS_QF_WINNERS
        #     bracket_results['QF'] = [...]

        if not bracket_results:
            raise CommandError('No bracket results to seed. Check --rounds parameter.')

        # Seed the results into the database (unless dry-run)
        if not dry_run:
            tournament_format.bracket_results = bracket_results
            tournament_format.save(update_fields=['bracket_results'])
            self.stdout.write(self.style.SUCCESS(
                f'Seeded {total_matches} bracket results ({", ".join(rounds_to_include)}) '
                f'for "{tournament.name}".'
            ))
        else:
            self.stdout.write(f'[dry-run] Would seed {total_matches} results for rounds: {", ".join(rounds_to_include)}')

        # Score all plays
        plays = TournamentPlay.objects.filter(tournament=tournament)
        total = plays.count()

        if total == 0:
            self.stdout.write(self.style.WARNING('No plays found for this tournament.'))
            return

        updated = 0
        for play in plays:
            points = score_bracket_stage(play.bracket_predictions, bracket_results)
            if dry_run:
                self.stdout.write(
                    f'  [dry-run] {play.user.username} / {play.name}: '
                    f'{points} bracket pts (group: {play.group_points})'
                )
            else:
                play.bracket_points = points
                play.save(update_fields=['bracket_points'])
                updated += 1

        if dry_run:
            self.stdout.write(self.style.SUCCESS(
                f'Dry run complete — {total} plays evaluated for bracket scoring ({", ".join(rounds_to_include)}).'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'Bracket finalized: {updated}/{total} plays scored for "{tournament.name}" ({", ".join(rounds_to_include)}).'
            ))
