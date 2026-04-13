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