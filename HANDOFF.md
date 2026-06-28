# Handoff — World Cup 2026 group results + bracket fill

Context note for continuing this work from a fresh Claude Code instance (e.g. on
the production VM). Conversations don't sync across machines; this file is the
bridge. Working from repo root unless noted. Tournament slug: `world-cup-2026`.

Production container name is **`vindro-django`** (deployed via
`vindro-django/deploy-production.sh`, which rebuilds the image so new code is
picked up; DB is the persistent `vindro-db-data` SQLite volume). No model
migrations are involved in any of this work.

---

## 1. Group stage — DONE ✅

The group standings were seeded and every play scored. Pipeline that already
ran in production:

```bash
docker exec vindro-django uv run python src/manage.py seed_group_results world-cup-2026
docker exec vindro-django uv run python src/manage.py finalize_group_stage world-cup-2026
```

Standings live in `tournament/schemes/world_cup_2026.py` (`GROUPS_RESULTS_ORDER`).
Scoring: 1 pt per correct group position, +2 perfect-card bonus (`scoring.py`).
Nothing left to do here unless a standing needs correcting (edit the order, then
re-run both commands — they're idempotent).

---

## 2. Bracket fill — CODE DONE, NOT YET DEPLOYED/SEEDED ⏳

New feature: resolve the R32 placeholder slots (`1A`, `2B`, `3A/B/C/D/F`, …) into
real teams, and make the bracket interactive (tap-to-pick winners, propagating
R32 → R16 → QF → SF → Final + 3rd place). **Bracket scoring is intentionally NOT
built yet** — filling/saving works, `bracket_points` stays 0 for now.

Files in this commit:
- `vindro-django/src/tournament/schemes/world_cup_2026.py` — `THIRD_PLACE_ALLOCATION`
- `vindro-django/src/tournament/brackets.py` — `resolve_r32_fixtures()`
- `vindro-django/src/tournament/management/commands/seed_bracket_r32.py`
- `vindro-vite/src/features/brackets/tournaments/world-cup-2026/stages/WorldCupBracketStage.jsx` — interactive rewrite
- `vindro-vite/src/features/brackets/pages/PlayPage.jsx` — `handleSaveBracket` + cancel ref wired

### Steps still to run on the VM

```bash
cd <repo>/vindro-django && git pull origin main && ./deploy-production.sh

# Resolve R32 -> real teams, writing into the master format + every play
docker exec vindro-django uv run python src/manage.py seed_bracket_r32 world-cup-2026 --dry-run   # preview
docker exec vindro-django uv run python src/manage.py seed_bracket_r32 world-cup-2026             # commit

# Extend the bracket editing deadline by 24h (close = tournament.bracket_start_date)
docker exec vindro-django uv run python src/manage.py shell -c \
  "from datetime import timedelta; from tournament.models import Tournament as T; \
   t=T.objects.get(slug='world-cup-2026'); t.bracket_start_date += timedelta(hours=24); \
   t.save(update_fields=['bracket_start_date']); print('bracket now closes:', t.bracket_start_date)"
```

### ⚠️ Verify before the non-dry-run
These are the resolved R32 fixtures `seed_bracket_r32` will write. Sanity-check
against FIFA — they're what everyone picks from:

```
73 South Africa vs Canada        81 United States vs Bosnia & Herzegovina
74 Germany vs Paraguay           82 Belgium vs Senegal
75 Netherlands vs Morocco        83 Portugal vs Croatia
76 Brazil vs Japan               84 Spain vs Austria
77 France vs Sweden              85 Switzerland vs Algeria
78 Ivory Coast vs Norway         86 Argentina vs Cape Verde
79 Mexico vs Ecuador             87 Colombia vs Ghana
80 England vs DR Congo           88 Australia vs Egypt
```
If any are wrong, fix `THIRD_PLACE_ALLOCATION` (third-place slots) or
`GROUPS_RESULTS_ORDER` (1st/2nd slots) and re-run.

---

## 3. Known follow-ups (not started)
- Bracket scoring: add a `score_bracket()` + a finalize command once knockout
  results come in, mirroring the group-stage pattern.
