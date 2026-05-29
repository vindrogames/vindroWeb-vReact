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
    master_format = play.tournament.format

    # Deep copy so we don't mutate the master reference
    groups_config = copy.deepcopy(master_format.groups_stage)

    # Shuffle teams within each group so users start with a random order.
    # groups_stage format: {"Group A": [{"team": ..., "flag": ...}, ...], ...}
    for group_name, teams in groups_config.items():
        if isinstance(teams, list):
            random.shuffle(teams)

    play.group_predictions = groups_config
    play.bracket_predictions = master_format.bracket_stage
    play.save()


def validate_group_predictions(incoming, master):
    """
    Validates incoming group_predictions against the tournament's master format.

    Rules:
    - Must be a dict.
    - Must contain exactly the same group keys as master (no extras, no missing).
    - Each group's team list must contain exactly the same teams as master
      (same count, same team names) — only ordering may differ.
    - Each entry must be a dict with 'team' and 'flag' keys.

    Returns (True, None) on success, (False, error_str) on failure.
    """
    if not isinstance(incoming, dict):
        return False, "group_predictions must be an object"

    incoming_keys = set(incoming.keys())
    expected_keys = set(master.keys())

    if incoming_keys != expected_keys:
        missing = sorted(expected_keys - incoming_keys)
        extra   = sorted(incoming_keys - expected_keys)
        parts = []
        if missing:
            parts.append(f"missing: {missing}")
        if extra:
            parts.append(f"unexpected: {extra}")
        return False, f"Group mismatch — {', '.join(parts)}"

    for group_name, teams in incoming.items():
        if not isinstance(teams, list):
            return False, f"{group_name}: value must be a list"

        master_teams = master[group_name]

        if len(teams) != len(master_teams):
            return False, (
                f"{group_name}: expected {len(master_teams)} teams, got {len(teams)}"
            )

        for i, entry in enumerate(teams):
            if not isinstance(entry, dict):
                return False, f"{group_name}[{i}]: each entry must be an object"
            if 'team' not in entry or 'flag' not in entry:
                return False, f"{group_name}[{i}]: missing 'team' or 'flag'"

        incoming_names = {t['team'] for t in teams}
        expected_names = {t['team'] for t in master_teams}

        if incoming_names != expected_names:
            added   = sorted(incoming_names - expected_names)
            removed = sorted(expected_names - incoming_names)
            parts = []
            if added:
                parts.append(f"unexpected teams: {added}")
            if removed:
                parts.append(f"missing teams: {removed}")
            return False, f"{group_name}: {', '.join(parts)}"

    return True, None