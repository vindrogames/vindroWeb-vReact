import importlib
import random
import copy

def get_scheme(slug):
    """Imports the scheme file based on the tournament slug (e.g., world-cup-2026)."""
    module_path = f"tournament.schemes.{slug.replace('-', '_')}"
    return importlib.import_module(module_path)

def seed_master_format(tournament_obj):
    """
    Updates the TournamentFormat record with the skeletons from the python file.
    Run this when the tournament is first created or the schedule changes.
    """
    scheme = get_scheme(tournament_obj.slug)
    fmt = tournament_obj.format  # Assuming the OneToOne relationship
    
    fmt.groups_stage = scheme.GROUPS_SKELETON
    fmt.bracket_stage = scheme.BRACKET_SKELETON
    fmt.save()


def initialize_user_play(play):
    """
    Populates a brand new TournamentPlay with the skeleton from TournamentFormat.
    """
    # 1. Access the "Master Map" via the OneToOne relationship
    master_format = play.tournament.format

    # 2. Deep copy the groups so we don't accidentally mutate the master reference
    groups_config = copy.deepcopy(master_format.groups_stage)

    # 3. Shuffle teams within each group so users start with a random order
    for group_id, data in groups_config.items():
        if 'teams' in data:
            random.shuffle(data['teams'])

    # 4. Apply the data to the user's specific play record
    play.group_predictions = groups_config
    play.bracket_predictions = master_format.bracket_stage
    play.save()