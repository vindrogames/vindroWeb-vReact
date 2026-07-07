"""
Tournament scoring logic for both Group Stage and Bracket Stage.

GROUP STAGE
-----------
Data contract (both predictions and results use the same shape):

    {
        "Group A": [{"team": "Mexico", "flag": "mx"}, ...],   # index 0 = 1st place
        "Group B": [...],
        ...
    }

score_group_stage(predictions, results) -> int
    Returns points earned: 1 per correct position, +2 bonus if every
    position across every group is correct (max 50 for a 12-group, 4-team
    tournament where 48 + 2 = 50).

BRACKET STAGE
-------------
Data contract:

    predictions = {
        "R32": [{"id": 73, "home": {...}, "away": {...}, "winner": {"name": "Canada", "flag": "ca"}}, ...],
        "R16": [...],
        "QF": [...],
        "SF": [...],
        "3rd": [...],
        "F": [...]
    }

    results = {
        "R32": [{"id": 73, "winner": {"name": "Canada", "flag": "ca"}}, ...],
        "R16": [...],
        ...
    }

score_bracket_stage(predictions, results) -> int
    Returns points earned based on correct winner picks per round:
    - R32: 2 points per match (16 matches = max 32 pts)
    - R16: 4 points per match (8 matches = max 32 pts)
    - QF:  8 points per match (4 matches = max 32 pts)
    - SF:  16 points per match (2 matches = max 32 pts)
    - 3rd: 16 points (1 match = max 16 pts)
    - F:   32 points (1 match = max 32 pts)
    Total max: 176 points
"""


def score_group_stage(predictions: dict, results: dict) -> int:
    """
    Score a single play's group predictions against the official results.

    Args:
        predictions: play.group_predictions
        results:     tournament.format.groups_results

    Returns:
        Integer points (0–50 for World Cup 2026).
    """
    if not results:
        raise ValueError("groups_results is empty — results have not been seeded yet.")

    correct = 0
    total_positions = 0

    for group_name, result_teams in results.items():
        pred_teams = predictions.get(group_name, [])

        for position, result_team in enumerate(result_teams):
            total_positions += 1
            if (
                position < len(pred_teams)
                and pred_teams[position].get('team') == result_team.get('team')
            ):
                correct += 1

    # Perfect card bonus: all positions correct across all groups
    if total_positions > 0 and correct == total_positions:
        correct += 2

    return correct


def score_bracket_stage(predictions: dict, results: dict) -> int:
    """
    Score a single play's bracket predictions against the official results.

    Points are awarded only for matches that have been completed (exist in results).
    Users earn points for correctly predicting the winner, regardless of whether
    they correctly predicted the matchup path (lenient scoring).

    Args:
        predictions: play.bracket_predictions - full bracket with user's winner picks
        results:     tournament.format.bracket_results - official winners by round

    Returns:
        Integer points (0–176 for World Cup 2026).
    """
    if not results:
        # No results yet means no points to award
        return 0

    # Points per correct pick by round
    POINTS_BY_ROUND = {
        "R32": 2,
        "R16": 4,
        "QF": 8,
        "SF": 16,
        "3rd": 16,
        "F": 32,
    }

    total_points = 0

    for round_key, points_per_match in POINTS_BY_ROUND.items():
        # Get the list of matches for this round from results
        result_matches = results.get(round_key, [])
        if not result_matches:
            # No results for this round yet, skip it
            continue

        # Get the list of matches for this round from predictions
        pred_matches = predictions.get(round_key, [])

        # Build a lookup dict: match_id -> winner for both predictions and results
        result_winners = {
            match["id"]: match.get("winner")
            for match in result_matches
            if match.get("winner") is not None
        }

        pred_winners = {
            match["id"]: match.get("winner")
            for match in pred_matches
            if match.get("winner") is not None
        }

        # Award points for each correct pick
        for match_id, official_winner in result_winners.items():
            user_winner = pred_winners.get(match_id)
            if user_winner and user_winner.get("name") == official_winner.get("name"):
                total_points += points_per_match

    return total_points
