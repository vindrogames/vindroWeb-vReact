"""
Group Stage scoring logic.

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
