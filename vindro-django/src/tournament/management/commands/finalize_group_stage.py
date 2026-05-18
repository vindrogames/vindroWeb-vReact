from django.core.management.base import BaseCommand, CommandError
from tournament.models import Tournament, TournamentPlay
from tournament.scoring import score_group_stage


class Command(BaseCommand):
    help = 'Score all plays for the group stage of a tournament and save the results.'

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
            groups_results = tournament.format.groups_results
        except Exception:
            raise CommandError('Tournament has no format record.')

        if not groups_results:
            raise CommandError('groups_results is empty — seed the results first.')

        plays = TournamentPlay.objects.filter(tournament=tournament)
        total = plays.count()

        if total == 0:
            self.stdout.write(self.style.WARNING('No plays found for this tournament.'))
            return

        updated = 0
        for play in plays:
            points = score_group_stage(play.group_predictions, groups_results)
            if dry_run:
                self.stdout.write(f'  [dry-run] {play.user.username} / {play.name}: {points} pts')
            else:
                play.group_points = points
                play.save(update_fields=['group_points'])
                updated += 1

        if dry_run:
            self.stdout.write(self.style.SUCCESS(f'Dry run complete — {total} plays evaluated.'))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'Group stage finalized: {updated}/{total} plays scored for "{tournament.name}".'
            ))
