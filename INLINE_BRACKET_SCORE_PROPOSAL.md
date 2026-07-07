# Inline Bracket Score Indicators - Frontend Proposal

## Overview
Display score indicators **directly on the bracket** so users instantly see which predictions they got right or wrong without any clicking. Each match should have a visual indicator showing the result.

---

## Visual Design

### Match Card States

Each match in the bracket should have one of these visual states:

```
┌─────────────────────────────────────┐
│ ✅ CORRECT (+2 pts)                 │
│ ┌─────────────────────────────────┐ │
│ │ 🇨🇦 Canada          [WINNER]   │ │  ← User's pick (green highlight)
│ │ 🇿🇦 South Africa               │ │
│ └─────────────────────────────────┘ │
│ Your pick: Canada ✓                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ❌ INCORRECT (+0 pts)               │
│ ┌─────────────────────────────────┐ │
│ │ 🇩🇪 Germany                    │ │  ← User's pick (red highlight)
│ │ 🇵🇾 Paraguay        [WINNER]   │ │  ← Actual winner (green checkmark)
│ └─────────────────────────────────┘ │
│ Your pick: Germany ✗ | Won: Paraguay│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⏳ NOT PLAYED YET                   │
│ ┌─────────────────────────────────┐ │
│ │ 🇫🇷 France          [PICK]     │ │  ← User's pick (blue/neutral)
│ │ 🇵🇾 Paraguay                   │ │
│ └─────────────────────────────────┘ │
│ Your pick: France                   │
└─────────────────────────────────────┘
```

---

## Implementation Approach

### Option 1: Badge Overlay (Recommended)

Add a small badge to each match card:

```jsx
// In WorldCupBracketStage.jsx or wherever matches are rendered

function BracketMatchCard({ match, userPick, actualResult, points }) {
  // Determine match status
  const status = getMatchStatus(match, userPick, actualResult);

  return (
    <div className={`bracket-match ${status.class}`}>
      {/* Status Badge - Top Right */}
      {status.badge && (
        <div className="match-status-badge">
          {status.badge}
        </div>
      )}

      {/* Match Teams */}
      <div className="match-teams">
        <div className={`team ${userPick?.name === match.home.name ? 'user-pick' : ''} ${actualResult?.name === match.home.name ? 'actual-winner' : ''}`}>
          <img src={`/flags/${match.home.flag}.svg`} className="flag" />
          <span className="team-name">{match.home.name}</span>
          {actualResult?.name === match.home.name && <span className="winner-check">✓</span>}
        </div>

        <div className={`team ${userPick?.name === match.away.name ? 'user-pick' : ''} ${actualResult?.name === match.away.name ? 'actual-winner' : ''}`}>
          <img src={`/flags/${match.away.flag}.svg`} className="flag" />
          <span className="team-name">{match.away.name}</span>
          {actualResult?.name === match.away.name && <span className="winner-check">✓</span>}
        </div>
      </div>

      {/* Status Text - Bottom */}
      {status.text && (
        <div className="match-status-text">
          {status.text}
        </div>
      )}
    </div>
  );
}

function getMatchStatus(match, userPick, actualResult) {
  // Match hasn't been played yet
  if (!actualResult) {
    return {
      class: 'pending',
      badge: null,
      text: userPick ? `Your pick: ${userPick.name}` : 'No prediction'
    };
  }

  // Match played - check if user was correct
  const isCorrect = userPick?.name === actualResult.name;

  if (isCorrect) {
    return {
      class: 'correct',
      badge: <span className="badge-correct">✓ +{match.points} pts</span>,
      text: null  // Visual is enough, no need for text
    };
  } else {
    return {
      class: 'incorrect',
      badge: <span className="badge-incorrect">✗ +0 pts</span>,
      text: userPick ? `You: ${userPick.name} | Won: ${actualResult.name}` : `Won: ${actualResult.name}`
    };
  }
}
```

### Option 2: Border + Icon Indicators (Simpler)

Just add colored borders and icons to existing match cards:

```jsx
function BracketMatchCard({ match, userPick, actualResult, points }) {
  const isCorrect = actualResult && userPick?.name === actualResult.name;
  const isIncorrect = actualResult && userPick && userPick.name !== actualResult.name;

  let borderClass = 'border-neutral';
  let statusIcon = null;

  if (isCorrect) {
    borderClass = 'border-correct';
    statusIcon = '✅';
  } else if (isIncorrect) {
    borderClass = 'border-incorrect';
    statusIcon = '❌';
  }

  return (
    <div className={`bracket-match ${borderClass}`}>
      {statusIcon && <span className="status-icon">{statusIcon}</span>}

      {/* Your existing match rendering code */}
      <div className="team">
        <img src={`/flags/${match.home.flag}.svg`} />
        {match.home.name}
        {userPick?.name === match.home.name && <span className="your-pick">★</span>}
      </div>

      <div className="team">
        <img src={`/flags/${match.away.flag}.svg`} />
        {match.away.name}
        {userPick?.name === match.away.name && <span className="your-pick">★</span>}
      </div>
    </div>
  );
}
```

---

## Styling

### Option 1 Styles (Badge Overlay)

```scss
.bracket-match {
  position: relative;
  padding: 12px;
  border-radius: 8px;
  background: #1F2833;
  margin-bottom: 10px;
  transition: all 0.3s;

  &.correct {
    border-left: 4px solid #45A29E;
    background: rgba(69, 162, 158, 0.1);

    .team.actual-winner {
      color: #66FCF1;
      font-weight: 600;
    }
  }

  &.incorrect {
    border-left: 4px solid #E62644;
    background: rgba(230, 38, 68, 0.1);

    .team.user-pick {
      opacity: 0.6;
      text-decoration: line-through;
    }

    .team.actual-winner {
      color: #66FCF1;
      font-weight: 600;
    }
  }

  &.pending {
    border-left: 4px solid #C5C6C7;

    .team.user-pick {
      color: #66FCF1;
      font-weight: 600;
    }
  }

  .match-status-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;

    .badge-correct {
      background: #45A29E;
      color: #0B0C10;
    }

    .badge-incorrect {
      background: #E62644;
      color: white;
    }
  }

  .match-teams {
    .team {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;

      .flag {
        width: 24px;
        height: 16px;
      }

      .winner-check {
        margin-left: auto;
        color: #45A29E;
        font-size: 1.2rem;
      }
    }
  }

  .match-status-text {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(197, 198, 199, 0.2);
    font-size: 0.85rem;
    color: #C5C6C7;
    font-style: italic;
  }
}
```

### Option 2 Styles (Border + Icon)

```scss
.bracket-match {
  position: relative;
  padding: 12px;
  border-radius: 8px;
  background: #1F2833;
  border: 2px solid transparent;
  transition: all 0.3s;

  &.border-correct {
    border-color: #45A29E;
    box-shadow: 0 0 12px rgba(69, 162, 158, 0.3);
  }

  &.border-incorrect {
    border-color: #E62644;
    box-shadow: 0 0 12px rgba(230, 38, 68, 0.3);
  }

  &.border-neutral {
    border-color: #C5C6C7;
  }

  .status-icon {
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 1.5rem;
    background: #0B0C10;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .your-pick {
    color: #FAC550;
    margin-left: 4px;
  }
}
```

---

## Score Summary Bar

Add a summary bar at the top of the bracket showing total progress:

```jsx
function BracketScoreSummary({ playData, tournamentResults }) {
  const breakdown = calculateRoundBreakdown(playData, tournamentResults);

  return (
    <div className="bracket-score-summary">
      <div className="summary-header">
        <h3>Your Bracket Performance</h3>
        <div className="total-score">
          <span className="label">Total Points:</span>
          <span className="value">{playData.bracket_points}</span>
        </div>
      </div>

      <div className="round-progress">
        {breakdown.map(round => (
          <div key={round.key} className="round-bar">
            <div className="round-label">{round.label}</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(round.earned / round.max) * 100}%` }}
              />
            </div>
            <div className="round-score">
              {round.earned} / {round.max} pts
              <span className="correct-count">({round.correct}/{round.total})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```scss
.bracket-score-summary {
  background: #0B0C10;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      color: #66FCF1;
      margin: 0;
    }

    .total-score {
      .label {
        font-size: 0.9rem;
        color: #C5C6C7;
        margin-right: 8px;
      }

      .value {
        font-size: 1.8rem;
        font-weight: bold;
        color: #66FCF1;
      }
    }
  }

  .round-progress {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .round-bar {
      .round-label {
        font-size: 0.85rem;
        color: #C5C6C7;
        margin-bottom: 4px;
      }

      .progress-bar {
        height: 8px;
        background: #1F2833;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 4px;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #45A29E, #66FCF1);
          transition: width 0.5s ease;
        }
      }

      .round-score {
        font-size: 0.9rem;
        color: #66FCF1;
        font-weight: 600;

        .correct-count {
          margin-left: 8px;
          color: #C5C6C7;
          font-weight: normal;
        }
      }
    }
  }
}
```

---

## Integration Points

### Update Existing Bracket Component

In your existing bracket rendering component (likely `WorldCupBracketStage.jsx`):

```jsx
// Fetch official results
const { data: tournamentResults } = useTournament(tournamentSlug, true); // doGetResults=true

// For each match in the bracket
const renderMatch = (match, roundKey) => {
  // Get user's prediction for this match
  const userPrediction = playData.bracket_predictions[roundKey]?.find(m => m.id === match.id);
  const userPick = userPrediction?.winner;

  // Get actual result for this match
  const officialResult = tournamentResults?.format?.bracket_results[roundKey]?.find(m => m.id === match.id);
  const actualWinner = officialResult?.winner;

  // Get points for this round
  const pointsPerMatch = { R32: 2, R16: 4, QF: 8, SF: 16, '3rd': 16, F: 32 }[roundKey];

  return (
    <BracketMatchCard
      key={match.id}
      match={match}
      userPick={userPick}
      actualResult={actualWinner}
      points={pointsPerMatch}
    />
  );
};
```

### Data Flow

```
User loads bracket page
  ↓
Fetch playData (user's predictions + bracket_points)
  ↓
Fetch tournamentResults (official bracket_results)
  ↓
For each match:
  - Compare playData.bracket_predictions[round][match]
    vs tournamentResults.format.bracket_results[round][match]
  ↓
Apply visual indicators:
  - Green border + checkmark = correct
  - Red border + X = incorrect
  - Gray border = not played yet
```

---

## Mobile Considerations

- Keep badges small but readable (min 28px touch target if interactive)
- Stack status text below match on narrow screens
- Use icons over text where possible (✓ vs "Correct")
- Make sure colored borders are obvious even on small screens (min 3px)

---

## Accessibility

- Use ARIA labels: `aria-label="Correct prediction, earned 2 points"`
- Don't rely only on color - use icons + text
- Ensure sufficient color contrast (WCAG AA minimum)

---

## Key Benefits

✅ **Instant feedback** - No clicking needed
✅ **Clear visualization** - Green/red borders are universal
✅ **Educational** - Users learn from mistakes immediately
✅ **Engaging** - Seeing progress motivates continued play
✅ **Simple to implement** - Enhances existing bracket UI

---

This approach gives users **immediate, always-visible feedback** right on their bracket without requiring any interaction!
