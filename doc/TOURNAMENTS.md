# Tournament Feature — Design & Plan

## Overview

Brackets/Pools tournament prediction feature. Users predict group standings and bracket outcomes for tournaments (e.g. World Cup 2026). One user can have multiple "plays" per tournament. Plays can belong to pools (public leaderboard or private friend groups).

---

## Data Model

```
Tournament (1)
 ├─ TournamentFormat (1-to-1)       # static structure + live results
 ├─ TournamentPool (1-to-many)
 │   ├─ is_public=True              # ONE auto-created "vindroPool" per tournament
 │   ├─ is_public=False             # private pools created by users
 │   └─ PoolMembership (join table) # links plays to pools
 └─ TournamentPlay (1-to-many)
     ├─ User (who made the play)
     └─ PoolMembership (which pools contain this play)
```

### `Tournament`
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | CharField(100) | "World Cup 2026" |
| tournament_type | CharField(50) | "world_cup", "champions_league" |
| start_date | DateTimeField | |
| end_date | DateTimeField | |
| groups_end_date | DateTimeField | when group phase ends |
| bracket_start_date | DateTimeField | when bracket predictions open |
| status | CharField | upcoming / active / completed |
| description | TextField | optional |
| image_url | URLField | optional |

### `TournamentFormat`
One-to-one with Tournament. Stores structure and results as JSON.

| Field | Type | Notes |
|---|---|---|
| tournament | OneToOneField | |
| groups | JSONField | static: teams per group |
| bracket | JSONField | static: bracket structure |
| groups_results | JSONField | filled as tournament progresses |
| bracket_results | JSONField | filled as tournament progresses |

**groups JSON example:**
```json
{
  "A": {
    "name": "Group A",
    "teams": [
      { "id": "esp", "name": "Spain", "flag": "🇪🇸" },
      { "id": "deu", "name": "Germany", "flag": "🇩🇪" }
    ]
  }
}
```

**bracket JSON example:**
```json
{
  "round_of_16": [
    {
      "match_id": "1",
      "match_number": 1,
      "team_a": { "id": "esp", "name": "Spain" },
      "team_b": { "id": "deu", "name": "Germany" },
      "source": { "type": "group", "group": "A", "position": 1 }
    }
  ],
  "quarter_finals": [],
  "semi_finals": [],
  "final": []
}
```

**groups_results JSON example:**
```json
{
  "A": [
    { "position": 1, "team_id": "esp", "points": 9, "gd": 5 },
    { "position": 2, "team_id": "deu", "points": 6, "gd": -2 }
  ]
}
```

**bracket_results JSON example:**
```json
{
  "round_of_16": [
    { "match_id": "1", "winner_id": "esp", "completed": true },
    { "match_id": "2", "winner_id": null, "completed": false }
  ]
}
```

### `TournamentPlay`
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tournament | ForeignKey(Tournament) | |
| user | ForeignKey(User) | |
| name | CharField(100) | "My Bold Predictions" |
| status | CharField | in_progress / submitted / completed |
| current_phase | CharField | groups / bracket / review / submitted |
| group_predictions | JSONField | same structure as groups_results |
| bracket_predictions | JSONField | same structure as bracket_results |
| score | IntegerField | calculated score (0 initially) |
| created_at | DateTimeField | |
| updated_at | DateTimeField | |

### `TournamentPool`
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tournament | ForeignKey(Tournament) | |
| name | CharField(100) | "vindroPool", "My Friends" |
| description | TextField | optional |
| created_by | ForeignKey(User, null=True) | null for public pool |
| is_public | BooleanField | True only for auto-generated pool |
| code_hash | CharField(255, unique, null) | bcrypt hash — private pools only |
| current_member_count | IntegerField | denormalized for fast pagination |
| created_at | DateTimeField | |

**Constraints:**
- `UniqueConstraint(tournament, is_public=True)` — only one public pool per tournament

### `PoolMembership`
| Field | Type | Notes |
|---|---|---|
| pool | ForeignKey(TournamentPool) | |
| play | ForeignKey(TournamentPlay) | |
| joined_at | DateTimeField | |

---

## API Endpoints

Base: `/api/tournament/`

### Tournaments
```
GET  /api/tournament/                          # List all tournaments
GET  /api/tournament/<id>/                     # Tournament detail + format structure
GET  /api/tournament/<id>/results/             # Current live results (groups_results, bracket_results)
```

### Plays
```
GET  /api/tournament/<id>/plays/               # Current user's plays for this tournament
POST /api/tournament/<id>/plays/               # Create new play (body: { "name": "My Play" })
GET  /api/tournament/plays/<play_id>/          # Get specific play
PATCH /api/tournament/plays/<play_id>/         # Update predictions (groups or bracket phase)
POST /api/tournament/plays/<play_id>/submit/   # Submit play (lock it in)
```

### Pools
```
GET  /api/tournament/<id>/pools/               # Public pool + user's private pools for this tournament
POST /api/tournament/<id>/pools/               # Create private pool
POST /api/tournament/<id>/pools/join/          # Join private pool via code
GET  /api/tournament/pools/<pool_id>/leaderboard/  # Pool leaderboard (plays + scores)
```

---

## Frontend Routes (for reference)

```
/brackets/                           → List of tournaments
/brackets/<tournament-slug>/         → TournamentPage (plays + pools hub)
/brackets/<tournament-slug>/<play-id>/  → TournamentPlayPage (play hub + edit modals)
```

---

## Implementation Plan

### Phase 1 — Models & Migrations
1. Write `tournament/models.py` with all 4 models
2. Generate migration
3. Register in `tournament/admin.py`
4. Add `tournament` to `INSTALLED_APPS` in settings

### Phase 2 — Tournament & Format endpoints (read-only, public)
- `GET /api/tournament/` — list
- `GET /api/tournament/<id>/` — detail with format
- `GET /api/tournament/<id>/results/` — live results

### Phase 3 — Play endpoints (auth required)
- `GET/POST /api/tournament/<id>/plays/`
- `GET/PATCH /api/tournament/plays/<play_id>/`
- `POST /api/tournament/plays/<play_id>/submit/`
- Auto-join public vindroPool on play creation

### Phase 4 — Pool endpoints (auth required)
- `GET /api/tournament/<id>/pools/`
- `POST /api/tournament/<id>/pools/` — create private pool (generate + hash code)
- `POST /api/tournament/<id>/pools/join/` — join via plain code (compare against hash)
- `GET /api/tournament/pools/<pool_id>/leaderboard/`

### Phase 5 — Serializers & response format
- Plain Python dicts (no DRF), consistent with the rest of the project
- Shared `serialize_*` functions in `tournament/serializers.py`

### Phase 6 — Wire up URLs
- Add `path("api/tournament/", include("tournament.urls"))` to `vindrobackend/urls.py`
