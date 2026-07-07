GROUPS_SKELETON = {
    "Group A": [
        {"team": "Mexico", "flag": "mx"},
        {"team": "South Africa", "flag": "za"},
        {"team": "Korea Republic", "flag": "kr"},
        {"team": "Czech Republic", "flag": "cz"},
    ],
    "Group B": [
        {"team": "Canada", "flag": "ca"},
        {"team": "Bosnia and Herzegovina", "flag": "ba"},
        {"team": "Qatar", "flag": "qa"},
        {"team": "Switzerland", "flag": "ch"},
    ],
    "Group C": [
        {"team": "Brazil", "flag": "br"},
        {"team": "Morocco", "flag": "ma"},
        {"team": "Haiti", "flag": "ht"},
        {"team": "Scotland", "flag": "gb-sct"},
    ],
    "Group D": [
        {"team": "United States", "flag": "us"},
        {"team": "Paraguay", "flag": "py"},
        {"team": "Australia", "flag": "au"},
        {"team": "Türkiye", "flag": "tr"},
    ],
    "Group E": [
        {"team": "Germany", "flag": "de"},
        {"team": "Curaçao", "flag": "cw"},
        {"team": "Ivory Coast", "flag": "ci"},
        {"team": "Ecuador", "flag": "ec"},
    ],
    "Group F": [
        {"team": "Netherlands", "flag": "nl"},
        {"team": "Japan", "flag": "jp"},
        {"team": "Sweden", "flag": "se"},
        {"team": "Tunisia", "flag": "tn"},
    ],
    "Group G": [
        {"team": "Belgium", "flag": "be"},
        {"team": "Egypt", "flag": "eg"},
        {"team": "Iran", "flag": "ir"},
        {"team": "New Zealand", "flag": "nz"},
    ],
    "Group H": [
        {"team": "Spain", "flag": "es"},
        {"team": "Cape Verde", "flag": "cv"},
        {"team": "Saudi Arabia", "flag": "sa"},
        {"team": "Uruguay", "flag": "uy"},
    ],
    "Group I": [
        {"team": "France", "flag": "fr"},
        {"team": "Senegal", "flag": "sn"},
        {"team": "Iraq", "flag": "iq"},
        {"team": "Norway", "flag": "no"},
    ],
    "Group J": [
        {"team": "Argentina", "flag": "ar"},
        {"team": "Algeria", "flag": "dz"},
        {"team": "Austria", "flag": "at"},
        {"team": "Jordan", "flag": "jo"},
    ],
    "Group K": [
        {"team": "Portugal", "flag": "pt"},
        {"team": "DR Congo", "flag": "cd"},
        {"team": "Uzbekistan", "flag": "uz"},
        {"team": "Colombia", "flag": "co"},
    ],
    "Group L": [
        {"team": "England", "flag": "gb-eng"},
        {"team": "Croatia", "flag": "hr"},
        {"team": "Ghana", "flag": "gh"},
        {"team": "Panama", "flag": "pa"},
    ],
}

# Final group-stage standings (1st -> 4th per group).
# Defined as the finishing ORDER of team names; the entries (with flags) are
# rebuilt from GROUPS_SKELETON below so spelling/flags can never drift from the
# canonical source the predictions were built against.
GROUPS_RESULTS_ORDER = {
    "Group A": ["Mexico", "South Africa", "Korea Republic", "Czech Republic"],
    "Group B": ["Switzerland", "Canada", "Bosnia and Herzegovina", "Qatar"],
    "Group C": ["Brazil", "Morocco", "Scotland", "Haiti"],
    "Group D": ["United States", "Australia", "Paraguay", "Türkiye"],
    "Group E": ["Germany", "Ivory Coast", "Ecuador", "Curaçao"],
    "Group F": ["Netherlands", "Japan", "Sweden", "Tunisia"],
    "Group G": ["Belgium", "Egypt", "Iran", "New Zealand"],
    "Group H": ["Spain", "Cape Verde", "Uruguay", "Saudi Arabia"],
    "Group I": ["France", "Norway", "Senegal", "Iraq"],
    "Group J": ["Argentina", "Austria", "Algeria", "Jordan"],
    "Group K": ["Colombia", "Portugal", "DR Congo", "Uzbekistan"],
    "Group L": ["England", "Croatia", "Ghana", "Panama"],
}


def _build_groups_results():
    """Rebuild the full {team, flag} result entries from the skeleton, in the
    finishing order given by GROUPS_RESULTS_ORDER. Raises if any name doesn't
    match the skeleton exactly, so a typo fails loudly instead of silently
    awarding zero points."""
    results = {}
    for group_name, order in GROUPS_RESULTS_ORDER.items():
        by_name = {t["team"]: t for t in GROUPS_SKELETON[group_name]}
        if set(order) != set(by_name):
            raise ValueError(
                f"{group_name}: results order {sorted(order)} does not match "
                f"skeleton teams {sorted(by_name)}"
            )
        results[group_name] = [by_name[name] for name in order]
    return results


GROUPS_RESULTS = _build_groups_results()

# Which group's 3rd-placed team fills each R32 third-place slot, keyed by R32
# match id. The slots in BRACKET_SKELETON read "3A/B/C/D/F" etc. — the eligible
# pool — but the actual assignment depends on WHICH eight thirds qualified, per
# FIFA's allocation table. These are the real assignments for this tournament
# (8 qualifying thirds: B, D, E, F, I, J, K, L). Each must be inside its slot's
# eligible pool; resolve_r32_fixtures validates that and fails loudly otherwise.
THIRD_PLACE_ALLOCATION = {
    74: "D",  # Germany vs Paraguay (3D)
    77: "F",  # France vs Sweden (3F)
    79: "E",  # Mexico vs Ecuador (3E)
    80: "K",  # England vs DR Congo (3K)
    81: "B",  # United States vs Bosnia and Herzegovina (3B)
    82: "I",  # Belgium vs Senegal (3I)
    85: "J",  # Switzerland vs Algeria (3J)
    87: "L",  # Colombia vs Ghana (3L)
}

BRACKET_SKELETON = {
    "R32": [
        # --- LEFT SIDE (Pathway 1) ---
        {"id": 73, "home": "2A", "away": "2B", "start_time": "28/06/2026 18:00", "winner": None},
        {"id": 75, "home": "1F", "away": "2C", "start_time": "29/06/2026 18:00", "winner": None},
        {"id": 74, "home": "1E", "away": "3A/B/C/D/F", "start_time": "29/06/2026 21:00", "winner": None},
        {"id": 77, "home": "1I", "away": "3C/D/F/G/H", "start_time": "30/06/2026 18:00", "winner": None},
        {"id": 76, "home": "1C", "away": "2F", "start_time": "30/06/2026 21:00", "winner": None},
        {"id": 78, "home": "2E", "away": "2I", "start_time": "01/07/2026 21:00", "winner": None},
        {"id": 79, "home": "1A", "away": "3C/E/F/H/I", "start_time": "01/07/2026 18:00", "winner": None},
        {"id": 80, "home": "1L", "away": "3E/H/I/J/K", "start_time": "02/07/2026 21:00", "winner": None},

        # --- RIGHT SIDE (Pathway 2) ---
        {"id": 81, "home": "1D", "away": "3B/E/F/I/J", "start_time": "02/07/2026 18:00", "winner": None},
        {"id": 82, "home": "1G", "away": "3A/E/H/I/J", "start_time": "03/07/2026 21:00", "winner": None},
        {"id": 83, "home": "2K", "away": "2L", "start_time": "03/07/2026 18:00", "winner": None},
        {"id": 84, "home": "1H", "away": "2J", "start_time": "04/07/2026 21:00", "winner": None},
        {"id": 85, "home": "1B", "away": "3E/F/G/I/J", "start_time": "04/07/2026 18:00", "winner": None},
        {"id": 87, "home": "1K", "away": "3D/E/I/J/L", "start_time": "05/07/2026 18:00", "winner": None},
        {"id": 86, "home": "1J", "away": "2H", "start_time": "05/07/2026 21:00", "winner": None},
        {"id": 88, "home": "2D", "away": "2G", "start_time": "06/07/2026 21:00", "winner": None},
    ],
    "R16": [
        # Left Side
        {"id": 89, "home": "W74", "away": "W77", "start_time": "07/07/2026 18:00", "winner": None},
        {"id": 90, "home": "W73", "away": "W75", "start_time": "07/07/2026 22:00", "winner": None},
        {"id": 91, "home": "W76", "away": "W78", "start_time": "08/07/2026 18:00", "winner": None},
        {"id": 92, "home": "W79", "away": "W80", "start_time": "08/07/2026 22:00", "winner": None},
        # Right Side
        {"id": 93, "home": "W83", "away": "W84", "start_time": "09/07/2026 18:00", "winner": None},
        {"id": 94, "home": "W81", "away": "W82", "start_time": "09/07/2026 22:00", "winner": None},
        {"id": 95, "home": "W86", "away": "W88", "start_time": "10/07/2026 18:00", "winner": None},
        {"id": 96, "home": "W85", "away": "W87", "start_time": "10/07/2026 22:00", "winner": None},
    ],
    "QF": [
        {"id": 97, "home": "W89", "away": "W90", "start_time": "12/07/2026 18:00", "winner": None},
        {"id": 98, "home": "W91", "away": "W92", "start_time": "12/07/2026 22:00", "winner": None},
        {"id": 99, "home": "W93", "away": "W94", "start_time": "13/07/2026 18:00", "winner": None},
        {"id": 100, "home": "W95", "away": "W96", "start_time": "13/07/2026 22:00", "winner": None},
    ],
    "SF": [
        {"id": 101, "home": "W97", "away": "W98", "start_time": "15/07/2026 21:00", "winner": None},
        {"id": 102, "home": "W99", "away": "W100", "start_time": "16/07/2026 21:00", "winner": None},
    ],
    "3rd": [{"id": 103, "home": "L101", "away": "L102", "start_time": "18/07/2026 21:00", "winner": None}],
    "F": [{"id": 104, "home": "W101", "away": "W102", "start_time": "19/07/2026 21:00", "winner": None}]
}

# Official bracket results - winners for completed rounds
# Each winner is stored as {"name": "Country", "flag": "code"} matching the bracket contract
BRACKET_RESULTS_R32_WINNERS = {
    73: {"name": "Canada", "flag": "ca"},           # Canada 1-0 South Africa
    74: {"name": "Paraguay", "flag": "py"},         # Paraguay 1-1 Germany (4-3 pens)
    75: {"name": "Morocco", "flag": "ma"},          # Morocco 1-1 Netherlands (3-2 pens)
    76: {"name": "Brazil", "flag": "br"},           # Brazil 2-1 Japan
    77: {"name": "France", "flag": "fr"},           # France 3-0 Sweden
    78: {"name": "Norway", "flag": "no"},           # Norway 2-1 Ivory Coast
    79: {"name": "Mexico", "flag": "mx"},           # Mexico 2-0 Ecuador
    80: {"name": "England", "flag": "gb-eng"},      # England 2-1 DR Congo
    81: {"name": "United States", "flag": "us"},    # USA 2-0 Bosnia & Herzegovina
    82: {"name": "Belgium", "flag": "be"},          # Belgium 3-2 Senegal
    83: {"name": "Portugal", "flag": "pt"},         # Portugal 2-1 Croatia
    84: {"name": "Spain", "flag": "es"},            # Spain 3-0 Austria
    85: {"name": "Switzerland", "flag": "ch"},      # Switzerland 2-0 Algeria
    86: {"name": "Argentina", "flag": "ar"},        # Argentina 3-2 Cape Verde
    87: {"name": "Colombia", "flag": "co"},         # Colombia 1-0 Ghana
    88: {"name": "Egypt", "flag": "eg"},            # Egypt 1-1 Australia (4-2 pens)
}

# Round of 16 winners (matches 89-96)
# Match IDs reference R32 winners: W73=Canada, W74=Paraguay, etc.
BRACKET_RESULTS_R16_WINNERS = {
    89: {"name": "France", "flag": "fr"},           # France 1-0 Paraguay (W74 vs W77)
    90: {"name": "Morocco", "flag": "ma"},          # Morocco 3-0 Canada (W73 vs W75)
    91: {"name": "Norway", "flag": "no"},           # Norway 2-1 Brazil (W76 vs W78)
    92: {"name": "England", "flag": "gb-eng"},      # England 3-2 Mexico (W79 vs W80)
    93: {"name": "Spain", "flag": "es"},            # Spain 1-0 Portugal (W83 vs W84)
    94: {"name": "Belgium", "flag": "be"},          # Belgium 4-1 USA (W81 vs W82)
    95: {"name": "Argentina", "flag": "ar"},        # Argentina 3-2 Egypt (W86 vs W88)
    96: {"name": "Switzerland", "flag": "ch"},           # Switzerland vs Colombia (W85 vs W87) - MATCH IN PROGRESS
}