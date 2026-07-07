from django.core.management.base import BaseCommand, CommandError
from tournament.models import Tournament, TournamentPlay
from tournament.scoring import score_bracket_stage


class Command(BaseCommand):
    help = 'Seed R32 bracket results and score all plays for completed bracket rounds.'

    def add_arguments(self, parser):
        parser.add_argument('slug', type=str, help='Tournament slug')
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print scores without saving anything',
        )

    def handle(self, *args, **options):
        slug = options['slug']
        dry_run = options['dry_run']

        try:
            tournament = Tournament.objects.select_related('format').get(slug=slug)
        except Tournament.DoesNotExist:
            raise CommandError(f'Tournament "{slug}" not found.')

        try:
            tournament_format = tournament.format
        except Exception:
            raise CommandError('Tournament has no format record.')

        # Import the R32 winners from the scheme
        from tournament.schemes.world_cup_2026 import BRACKET_RESULTS_R32_WINNERS

        # Build the bracket_results structure with R32 winners
        # We store only the match id and winner to keep it lean
        bracket_results = {
            "R32": [
                {"id": match_id, "winner": winner}
                for match_id, winner in BRACKET_RESULTS_R32_WINNERS.items()
            ]
        }

        # Seed the results into the database (unless dry-run)
        if not dry_run:
            tournament_format.bracket_results = bracket_results
            tournament_format.save(update_fields=['bracket_results'])
            self.stdout.write(self.style.SUCCESS(
                f'Seeded R32 bracket results ({len(BRACKET_RESULTS_R32_WINNERS)} matches) '
                f'for "{tournament.name}".'
            ))
        else:
            self.stdout.write(f'[dry-run] Would seed {len(BRACKET_RESULTS_R32_WINNERS)} R32 results.')

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
                f'Dry run complete — {total} plays evaluated for R32 bracket scoring.'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'Bracket R32 finalized: {updated}/{total} plays scored for "{tournament.name}".'
            ))
