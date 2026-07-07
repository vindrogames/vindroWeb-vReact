# Bracket Score Breakdown Overlay - Frontend Proposal

## Overview
Add an interactive overlay/modal that shows users exactly which bracket predictions they got right or wrong, with a detailed points breakdown.

---

## User Flow

1. **Trigger**: User clicks a "View Score Breakdown" button on their play card or bracket page
2. **Display**: Modal/overlay opens showing their bracket with visual indicators
3. **Interaction**: User can see at a glance which picks earned points and which didn't

---

## Design Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  ✕  Score Breakdown: "My Bracket"          Total: 52 pts   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Points by Round                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Round of 32  ✓ 24 / 32 pts  (12/16 correct)          │  │
│  │ Round of 16  ✓ 28 / 32 pts  (7/8 correct)            │  │
│  │ Quarter Finals  - 0 / 32 pts  (not yet played)       │  │
│  │ Semi Finals     - 0 / 32 pts  (not yet played)       │  │
│  │ 3rd Place       - 0 / 16 pts  (not yet played)       │  │
│  │ Final           - 0 / 32 pts  (not yet played)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  🏆 Round of 32 Matches (24 / 32 pts)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ✅ Canada vs South Africa → Canada (+2 pts)          │  │
│  │ ✅ Morocco vs Netherlands → Morocco (+2 pts)         │  │
│  │ ✅ France vs Sweden → France (+2 pts)                │  │
│  │ ❌ Germany vs Paraguay → You: Germany | Won: Paraguay│  │
│  │ ✅ Brazil vs Japan → Brazil (+2 pts)                 │  │
│  │ ❌ Ivory Coast vs Norway → You: Ivory Coast | Won: Norway│
│  │ ✅ Mexico vs Ecuador → Mexico (+2 pts)               │  │
│  │ ✅ England vs DR Congo → England (+2 pts)            │  │
│  │ ✅ USA vs Bosnia & Herzegovina → USA (+2 pts)        │  │
│  │ ✅ Belgium vs Senegal → Belgium (+2 pts)             │  │
│  │ ✅ Portugal vs Croatia → Portugal (+2 pts)           │  │
│  │ ❌ Spain vs Austria → You: Austria | Won: Spain      │  │
│  │ ✅ Switzerland vs Algeria → Switzerland (+2 pts)     │  │
│  │ ✅ Argentina vs Cape Verde → Argentina (+2 pts)      │  │
│  │ ✅ Colombia vs Ghana → Colombia (+2 pts)             │  │
│  │ ❌ Australia vs Egypt → You: Australia | Won: Egypt  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  🏆 Round of 16 Matches (28 / 32 pts)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ✅ Paraguay vs France → France (+4 pts)              │  │
│  │ ✅ Canada vs Morocco → Morocco (+4 pts)              │  │
│  │ ❌ Brazil vs Norway → You: Brazil | Won: Norway      │  │
│  │ ✅ Mexico vs England → England (+4 pts)              │  │
│  │ ✅ Portugal vs Spain → Spain (+4 pts)                │  │
│  │ ✅ USA vs Belgium → Belgium (+4 pts)                 │  │
│  │ ✅ Argentina vs Egypt → Argentina (+4 pts)           │  │
│  │ ✅ Switzerland vs Colombia → Switzerland (+4 pts)    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [ Close ]                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Structure

### New Components

```
features/brackets/components/
├── BracketScoreBreakdown.jsx       # Main modal component
├── RoundScoreSummary.jsx           # Summary card per round
└── MatchScoreItem.jsx              # Individual match result item
```

### File: `BracketScoreBreakdown.jsx`

```jsx
import { useState } from 'react';
import { FaTimes, FaCheckCircle, FaTimesCircle, FaMinusCircle } from 'react-icons/fa';
import './BracketScoreBreakdown.scss';

export default function BracketScoreBreakdown({ play, tournament, onClose }) {
  const [expandedRound, setExpandedRound] = useState('R32');

  // Calculate score breakdown from play.bracket_predictions vs tournament.format.bracket_results
  const breakdown = calculateBreakdown(play, tournament);

  return (
    <div className="bracket-score-modal-overlay" onClick={onClose}>
      <div className="bracket-score-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Score Breakdown: "{play.name}"</h2>
          <div className="total-score">
            <span className="label">Total Bracket Points:</span>
            <span className="value">{play.bracket_points}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Round Summaries */}
        <div className="round-summaries">
          <h3>📊 Points by Round</h3>
          {breakdown.rounds.map(round => (
            <RoundScoreSummary
              key={round.key}
              round={round}
              isExpanded={expandedRound === round.key}
              onToggle={() => setExpandedRound(expandedRound === round.key ? null : round.key)}
            />
          ))}
        </div>

        {/* Detailed Match Breakdown (for expanded round) */}
        {expandedRound && (
          <div className="match-details">
            <h3>🏆 {breakdown.rounds.find(r => r.key === expandedRound).label} Matches</h3>
            <div className="match-list">
              {breakdown.matchesByRound[expandedRound].map(match => (
                <MatchScoreItem key={match.id} match={match} />
              ))}
            </div>
          </div>
        )}

        <button className="close-btn-bottom" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

### File: `RoundScoreSummary.jsx`

```jsx
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function RoundScoreSummary({ round, isExpanded, onToggle }) {
  const statusIcon = round.played ? '✓' : '-';
  const statusClass = round.played ? 'completed' : 'pending';

  return (
    <div
      className={`round-summary ${statusClass} ${isExpanded ? 'expanded' : ''}`}
      onClick={round.played ? onToggle : null}
      style={{ cursor: round.played ? 'pointer' : 'default' }}
    >
      <div className="round-info">
        <span className="status-icon">{statusIcon}</span>
        <span className="round-name">{round.label}</span>
        <span className="points">
          {round.earned} / {round.max} pts
        </span>
        <span className="correct-count">
          ({round.correct}/{round.total} correct)
        </span>
      </div>
      {round.played && (
        <span className="expand-icon">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      )}
    </div>
  );
}
```

### File: `MatchScoreItem.jsx`

```jsx
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function MatchScoreItem({ match }) {
  const isCorrect = match.userPick?.name === match.actualWinner?.name;

  return (
    <div className={`match-item ${isCorrect ? 'correct' : 'incorrect'}`}>
      <span className="icon">
        {isCorrect ? <FaCheckCircle className="correct-icon" /> : <FaTimesCircle className="incorrect-icon" />}
      </span>
      <div className="match-info">
        <span className="matchup">
          <img src={`/flags/${match.home.flag}.svg`} alt="" className="flag" />
          {match.home.name}
          <span className="vs">vs</span>
          <img src={`/flags/${match.away.flag}.svg`} alt="" className="flag" />
          {match.away.name}
        </span>
        {isCorrect ? (
          <span className="result correct-result">
            → {match.actualWinner.name} (+{match.points} pts)
          </span>
        ) : (
          <span className="result incorrect-result">
            You: {match.userPick?.name || 'No pick'} | Won: {match.actualWinner.name}
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## Scoring Logic Helper

### File: `features/brackets/utils/calculateBreakdown.js`

```javascript
/**
 * Calculate detailed score breakdown for a user's bracket predictions
 * @param {Object} play - TournamentPlay with bracket_predictions
 * @param {Object} tournament - Tournament with format.bracket_results
 * @returns {Object} - Breakdown with rounds and matches
 */
export function calculateBreakdown(play, tournament) {
  const predictions = play.bracket_predictions || {};
  const results = tournament.format.bracket_results || {};

  const POINTS_BY_ROUND = {
    R32: 2,
    R16: 4,
    QF: 8,
    SF: 16,
    '3rd': 16,
    F: 32,
  };

  const ROUND_LABELS = {
    R32: 'Round of 32',
    R16: 'Round of 16',
    QF: 'Quarter Finals',
    SF: 'Semi Finals',
    '3rd': '3rd Place',
    F: 'Final',
  };

  const rounds = [];
  const matchesByRound = {};

  for (const [roundKey, pointsPerMatch] of Object.entries(POINTS_BY_ROUND)) {
    const predMatches = predictions[roundKey] || [];
    const resultMatches = results[roundKey] || [];

    // Build result lookup
    const resultWinners = {};
    resultMatches.forEach(rm => {
      if (rm.winner) resultWinners[rm.id] = rm.winner;
    });

    // Calculate correct picks
    let correct = 0;
    let earned = 0;
    const matches = [];

    predMatches.forEach(pm => {
      const actualWinner = resultWinners[pm.id];
      const userPick = pm.winner;
      const isCorrect = userPick && actualWinner && userPick.name === actualWinner.name;

      if (isCorrect) {
        correct++;
        earned += pointsPerMatch;
      }

      if (actualWinner) {
        matches.push({
          id: pm.id,
          home: pm.home,
          away: pm.away,
          userPick,
          actualWinner,
          points: pointsPerMatch,
          isCorrect,
        });
      }
    });

    const total = resultMatches.length;
    const maxPoints = total * pointsPerMatch;
    const played = total > 0;

    rounds.push({
      key: roundKey,
      label: ROUND_LABELS[roundKey],
      correct,
      total,
      earned,
      max: maxPoints,
      played,
    });

    matchesByRound[roundKey] = matches;
  }

  return { rounds, matchesByRound };
}
```

---

## Styling

### File: `features/brackets/components/BracketScoreBreakdown.scss`

```scss
.bracket-score-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.bracket-score-modal {
  background: #1F2833;
  border-radius: 12px;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  color: #C5C6C7;

  .modal-header {
    position: sticky;
    top: 0;
    background: #0B0C10;
    padding: 20px;
    border-bottom: 2px solid #45A29E;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      color: #66FCF1;
      font-size: 1.5rem;
    }

    .total-score {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .label {
        font-size: 0.85rem;
        color: #C5C6C7;
      }

      .value {
        font-size: 2rem;
        font-weight: bold;
        color: #66FCF1;
      }
    }

    .close-btn {
      background: none;
      border: none;
      color: #C5C6C7;
      font-size: 1.5rem;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #66FCF1;
      }
    }
  }

  .round-summaries {
    padding: 20px;

    h3 {
      color: #66FCF1;
      margin-bottom: 15px;
    }
  }

  .round-summary {
    background: #0B0C10;
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;

    &.completed:hover {
      background: #2a3140;
      transform: translateX(4px);
    }

    &.pending {
      opacity: 0.5;
    }

    &.expanded {
      background: #45A29E;
      color: #0B0C10;
    }

    .round-info {
      display: flex;
      gap: 12px;
      align-items: center;

      .status-icon {
        font-size: 1.2rem;
      }

      .round-name {
        font-weight: 600;
        min-width: 140px;
      }

      .points {
        font-weight: bold;
        color: #66FCF1;
      }

      .correct-count {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
  }

  .match-details {
    padding: 20px;
    background: #0B0C10;
    margin: 0 20px 20px;
    border-radius: 8px;

    h3 {
      color: #66FCF1;
      margin-bottom: 15px;
    }
  }

  .match-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    margin-bottom: 8px;
    border-radius: 6px;
    background: #1F2833;

    &.correct {
      border-left: 4px solid #45A29E;
    }

    &.incorrect {
      border-left: 4px solid #E62644;
    }

    .icon {
      font-size: 1.2rem;

      .correct-icon {
        color: #45A29E;
      }

      .incorrect-icon {
        color: #E62644;
      }
    }

    .match-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .matchup {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;

        .flag {
          width: 20px;
          height: 14px;
        }

        .vs {
          font-size: 0.85rem;
          opacity: 0.6;
        }
      }

      .result {
        font-size: 0.9rem;

        &.correct-result {
          color: #45A29E;
        }

        &.incorrect-result {
          color: #E62644;
        }
      }
    }
  }

  .close-btn-bottom {
    margin: 0 20px 20px;
    width: calc(100% - 40px);
    padding: 12px;
    background: #45A29E;
    color: #0B0C10;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #66FCF1;
    }
  }
}
```

---

## Integration Points

### 1. Add Button to Play Card

In `PlayPage.jsx` or wherever individual plays are displayed:

```jsx
import BracketScoreBreakdown from '../components/BracketScoreBreakdown';

// ... in component
const [showBreakdown, setShowBreakdown] = useState(false);

// ... in JSX
<button onClick={() => setShowBreakdown(true)} className="view-breakdown-btn">
  📊 View Score Breakdown
</button>

{showBreakdown && (
  <BracketScoreBreakdown
    play={playData}
    tournament={tournament}
    onClose={() => setShowBreakdown(false)}
  />
)}
```

### 2. Add to Leaderboard Entry

Show breakdown for any user's play on leaderboards:

```jsx
<td>
  <button onClick={() => handleShowBreakdown(play)}>
    {play.bracket_points} pts
  </button>
</td>
```

---

## Mobile Responsiveness

- Modal takes full screen on mobile (95% width/height)
- Scrollable match list
- Collapsible rounds by default (expand one at a time)
- Touch-friendly tap targets (min 44px)

---

## Future Enhancements

1. **Comparison Mode**: Compare your bracket against another user's
2. **Share Button**: Generate shareable image of breakdown
3. **Filters**: Show only correct/incorrect picks
4. **Stats**: "You beat 68% of users in R16!"
5. **Animations**: Confetti for high scores, shake for upsets you missed

---

## Technical Notes

- **Performance**: Calculate breakdown on-demand (not stored in DB)
- **Caching**: Memoize breakdown calculation with useMemo
- **Accessibility**: Keyboard navigation, ARIA labels, focus management
- **Error Handling**: Gracefully handle missing data (no predictions, no results yet)

---

This proposal provides a comprehensive, user-friendly way for players to see exactly where they earned (or lost) points in their bracket predictions!
