"""
Resolve knockout-bracket placeholder slots into real teams.

R32 home/away in BRACKET_SKELETON are placeholder codes:
  - "1A".."4L"      -> the Nth-placed team of that group (1 = winner)
  - "3A/B/C/D/F"     -> one of the qualifying third-placed teams. Which group's
                        third actually fills the slot depends on FIFA's official
                        allocation table, supplied per match id via
                        THIRD_PLACE_ALLOCATION on the scheme.

Resolved teams use the frontend bracket contract: {"name": ..., "flag": ...}.
(Group results store the name under "team"; the bracket renders {name, flag}.)

Later rounds (R16+) keep their "W##" / "L##" reference strings untouched — the
frontend resolves those from the user's own winner picks.
"""

_POSITION_INDEX = {"1": 0, "2": 1, "3": 2, "4": 3}


def _team_obj(group_entry):
    return {"name": group_entry["team"], "flag": group_entry["flag"]}


def _resolve_slot(code, match_id, groups_results, third_place_allocation):
    code = str(code)

    # Third-place pool slot, e.g. "3A/B/C/D/F"
    if "/" in code:
        eligible = code[1:].split("/")  # ["A","B","C","D","F"]
        group_letter = third_place_allocation.get(match_id)
        if group_letter is None:
            raise ValueError(
                f"Match {match_id}: third-place slot {code!r} has no entry in "
                f"THIRD_PLACE_ALLOCATION."
            )
        if group_letter not in eligible:
            raise ValueError(
                f"Match {match_id}: allocated group {group_letter!r} is not in the "
                f"eligible pool {eligible} for slot {code!r}."
            )
        standings = groups_results[f"Group {group_letter}"]
        return _team_obj(standings[2])

    # Simple "<position><group>" slot, e.g. "2A"
    pos, group_letter = code[0], code[1:]
    index = _POSITION_INDEX.get(pos)
    if index is None:
        raise ValueError(f"Match {match_id}: unrecognised slot code {code!r}.")
    standings = groups_results.get(f"Group {group_letter}")
    if standings is None or index >= len(standings):
        raise ValueError(
            f"Match {match_id}: no team for slot {code!r} in group results."
        )
    return _team_obj(standings[index])


def resolve_r32_fixtures(groups_results, bracket_skeleton, third_place_allocation):
    """Return a new R32 list with home/away resolved to real {name, flag} teams.

    Raises ValueError if any slot can't be resolved, so a bad allocation or
    missing result fails loudly instead of shipping placeholder text to users.
    """
    if not groups_results:
        raise ValueError("groups_results is empty — finalize the group stage first.")

    allocation = {int(k): v for k, v in third_place_allocation.items()}

    resolved = []
    for match in bracket_skeleton.get("R32", []):
        m = dict(match)
        m["home"] = _resolve_slot(match["home"], match["id"], groups_results, allocation)
        m["away"] = _resolve_slot(match["away"], match["id"], groups_results, allocation)
        resolved.append(m)
    return resolved
