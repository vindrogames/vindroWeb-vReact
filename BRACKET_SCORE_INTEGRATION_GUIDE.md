# Bracket Score Indicators - Integration Guide

## Files Created

✅ **Utility Functions**
- `/src/features/brackets/utils/matchStatus.js` - Helper functions for match status calculation

✅ **Components**
- `/src/features/brackets/components/BracketScoreSummary.jsx` - Score summary bar with progress
- `/src/features/brackets/components/BracketScoreSummary.scss` - Styles for summary

✅ **Styles**
- `/src/features/brackets/styles/matchStatus.scss` - Match status indicator styles

---

## Integration Steps

### Step 1: Import Styles into Bracket Component

In `WorldCupBracketStage.jsx`, add at the top:

```javascript
import '../styles/matchStatus.scss';
```

### Step 2: Add Props to Receive Official Results

The bracket component needs to receive the official bracket results. Update the component signature:

```javascript
const WorldCupBracketStage = ({
  data,                    // User's predictions
  officialResults,         // NEW: Official bracket results from tournament.format.bracket_results
  totalBracketPoints,      // NEW: User's total bracket points
  isEditable,
  onSave,
  loginBanner,
  cancelEditRef,
  onEditingChange
}) => {
  // ... existing code
}
```

### Step 3: Add Score Summary at Top

After the component state declarations, before the bracket rendering, add:

```javascript
import BracketScoreSummary from '../../../components/BracketScoreSummary';

// ... in the component JSX, before the bracket
return (
  <div className="bk-stage">
    {/* Add Score Summary */}
    {officialResults && !isEditing && (
      <BracketScoreSummary
        bracketPredictions={working}
        bracketResults={officialResults}
        totalBracketPoints={totalBracketPoints || 0}
      />
    )}

    {/* Existing bracket rendering */}
    {/* ... rest of component */}
  </div>
);
```

### Step 4: Enhanced Team Card Rendering

Update the `Card` component to accept status information:

```javascript
import { getMatchStatus, sameTeam } from '../../../utils/matchStatus';

const Card = ({
  team,
  selected,
  clickable,
  onClick,
  t,
  isCorrectPick,      // NEW
  isActualWinner,     // NEW
  isPending,          // NEW
  showWinnerCheck     // NEW
}) => {
  let statusClass = '';
  if (isCorrectPick) statusClass = 'team-card--correct-pick';
  else if (isActualWinner && !isCorrectPick) statusClass = 'team-card--actual-winner';
  else if (isPending && selected) statusClass = 'team-card--user-pick-pending';

  return (
    <div
      className={`team-card${!team ? ' team-card--empty' : ''}${selected ? ' team-card--selected' : ''}${clickable && team ? ' team-card--clickable' : ''} ${statusClass}`}
      onClick={clickable && team ? onClick : undefined}
      role={clickable && team ? 'button' : undefined}
    >
      <TeamLabel team={team} t={t} />
      {showWinnerCheck && isActualWinner && <span className="winner-check">✓</span>}
    </div>
  );
};
```

### Step 5: Enhanced R32Match with Status Badge

Update the `R32Match` component to show status badges:

```javascript
const R32Match = ({ match, byId, isEditing, onPick, t, officialResults }) => {
  const home = resolveTeam(match.home, byId);
  const away = resolveTeam(match.away, byId);
  const w = resolveTeam(match.winner, byId);

  // Get official result for this match
  const officialMatch = officialResults?.R32?.find(m => m.id === match.id);
  const actualWinner = officialMatch?.winner;

  // Calculate match status
  const POINTS_R32 = 2;
  const status = actualWinner
    ? getMatchStatus(match, w, actualWinner, POINTS_R32)
    : { class: 'pending', badge: null };

  const homeIsActualWinner = actualWinner && sameTeam(actualWinner, home);
  const awayIsActualWinner = actualWinner && sameTeam(actualWinner, away);
  const homeIsCorrect = w && actualWinner && sameTeam(w, home) && sameTeam(actualWinner, home);
  const awayIsCorrect = w && actualWinner && sameTeam(w, away) && sameTeam(actualWinner, away);

  return (
    <div className={`teams-container match-${status.class}`}>
      {/* Status Badge */}
      {status.badge && !isEditing && (
        <div className={`match-status-badge badge-${status.class}`}>
          <span className="badge-icon">{status.badge.icon}</span>
          <span className="badge-text">{status.badge.text}</span>
        </div>
      )}

      {/* Team Cards */}
      <Card
        team={home}
        selected={sameTeam(w, home)}
        clickable={isEditing}
        onClick={() => onPick(match.id, home)}
        t={t}
        isCorrectPick={homeIsCorrect}
        isActualWinner={homeIsActualWinner}
        isPending={!actualWinner}
        showWinnerCheck={!isEditing && actualWinner}
      />
      <Card
        team={away}
        selected={sameTeam(w, away)}
        clickable={isEditing}
        onClick={() => onPick(match.id, away)}
        t={t}
        isCorrectPick={awayIsCorrect}
        isActualWinner={awayIsActualWinner}
        isPending={!actualWinner}
        showWinnerCheck={!isEditing && actualWinner}
      />

      {/* Status Text (for incorrect picks) */}
      {status.text && !isEditing && (
        <div className={`match-status-text ${status.class === 'pending' ? 'status-pending' : ''}`}>
          {status.text}
        </div>
      )}
    </div>
  );
};
```

### Step 6: Pass Official Results Through Component Tree

Update `QuarterCard` to pass `officialResults` down:

```javascript
const QuarterCard = ({ qf, side, byId, parentOf, isEditing, onPick, t, activeRound, officialResults }) => {
  // ... existing code

  const col1 = (
    <div className="round-col round-1-col" key="c1">
      {r32s.map((m) => (
        <R32Match
          key={m.id}
          match={m}
          byId={byId}
          isEditing={isEditing}
          onPick={onPick}
          t={t}
          officialResults={officialResults}  // NEW
        />
      ))}
    </div>
  );

  // ... rest of component
};
```

### Step 7: Update Parent Component to Pass Data

In the parent component that renders `WorldCupBracketStage` (likely `PlayPage.jsx` or similar):

```javascript
import { useTournament } from '../hooks/useTournament';

// In the component:
const { data: tournamentData } = useTournament(tournamentSlug, true); // doGetResults=true

// Then pass to bracket:
<WorldCupBracketStage
  data={playData.bracket_predictions}
  officialResults={tournamentData?.format?.bracket_results}
  totalBracketPoints={playData.bracket_points}
  isEditable={isEditable}
  onSave={handleSave}
  // ... other props
/>
```

---

## Points Per Round Reference

```javascript
const POINTS_BY_ROUND = {
  R32: 2,
  R16: 4,
  QF: 8,
  SF: 16,
  '3rd': 16,
  F: 32,
};
```

Use these values when calling `getMatchStatus()` for different rounds.

---

## Testing Scenarios

### Test Case 1: Correct Prediction
- User predicted: Brazil
- Actual winner: Brazil
- Expected: Green border, ✓ badge, "+2 pts"

### Test Case 2: Incorrect Prediction
- User predicted: Germany
- Actual winner: Paraguay
- Expected: Red border, ✗ badge, status text showing "You: Germany | Won: Paraguay"

### Test Case 3: Match Not Played
- User predicted: France
- Actual winner: null
- Expected: Yellow/gray border, no badge, "Your pick: France"

### Test Case 4: No Prediction
- User predicted: null
- Actual winner: Spain
- Expected: Neutral display, "Won: Spain"

---

## Visual Indicators Legend

| State | Border Color | Badge | Status Text |
|-------|-------------|-------|-------------|
| Correct | Green (#45A29E) | ✓ +X pts | None |
| Incorrect | Red (#E62644) | ✗ +0 pts | You: X \| Won: Y |
| Pending (with pick) | Yellow (#FAC550) | None | Your pick: X |
| Pending (no pick) | Gray | None | No prediction |

---

## Mobile Considerations

All styles are responsive with breakpoints at 678px. On mobile:
- Badges are smaller but still readable
- Status text wraps properly
- Progress bars are narrower

---

## Performance Notes

- `getMatchStatus()` is called per match render - this is fine for bracket sizes
- Consider memoizing `calculateRoundBreakdown()` if performance issues arise
- The status calculations are pure functions with no side effects

---

## Future Enhancements

- [ ] Animate progress bars when points update
- [ ] Add confetti effect for high scores
- [ ] Comparison mode (compare two users' brackets side-by-side)
- [ ] Export bracket as image with score highlights
