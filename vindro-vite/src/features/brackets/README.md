# Tournament Brackets - Multi-Tournament Architecture

This folder contains a reusable, generic tournament prediction system with support for multiple tournaments (World Cup, Euro Cup, Champions League, etc.).

## Directory Structure

```
/brackets/
├── hooks/                              # Generic, reusable hooks
│   ├── useGroupPredictions.js         # Group prediction state management
│   ├── useSwapLogic.js                # Bracket swap calculations (Fibonacci costs)
│   ├── usePlaySession.js              # Play session state (existing)
│   ├── useSwipe.js                    # Handle swipe gestures (existing)
│   └── index.js
│
├── components/                         # Generic, reusable React components
│   ├── TournamentPlayPage.jsx         # Main hub component (tournament-agnostic)
│   ├── TournamentGroupsModal.jsx      # Group prediction modal
│   ├── StageCards/                    # Progress display cards
│   │   ├── GroupsStageCard.jsx        # Groups progress card
│   │   ├── BracketStageCard.jsx       # Bracket progress card  
│   │   └── ReviewStageCard.jsx        # Review/submit card
│   ├── Modals/                        # Prediction input modals
│   │   ├── BracketPredictionModal.jsx # Bracket selection modal
│   │   └── ReviewSubmitModal.jsx      # Final review modal
│   ├── TeamDragHandle.jsx             # (existing)
│   ├── index.js
│   └── styles/                        # Shared component styles
│
├── data/                               # Shared tournament data structures
│   └── (for future shared configs)
│
├── world-cup-2026/                    # World Cup 2026 (tournament-specific)
│   ├── WorldCupTournament_2026.jsx   # Overview/discovery page
│   ├── pages/
│   │   └── TournamentPlayPage.jsx    # Wrapper that uses generic component
│   ├── components/
│   │   ├── EventDescription.jsx
│   │   ├── JoinPoolModal.jsx
│   │   └── PlayNameModal.jsx
│   ├── data/
│   │   ├── worldCup2026Groups.js
│   │   ├── worldCup2026Teams.js
│   │   └── mockPlay.js
│   ├── hooks/
│   ├── ARCHITECTURE_GUIDE.md
│   └── README.md
│
├── europe-cup-2024/                   # Euro Cup 2024 (stub - ready for implementation)
│   ├── EuropeCup2024.jsx
│   ├── pages/
│   ├── components/
│   ├── data/
│   └── hooks/
│
├── champions-league-2026/             # Champions League 2026 (stub - ready for implementation)
│   ├── ChampionsLeague2026.jsx
│   ├── pages/
│   ├── components/
│   ├── data/
│   └── hooks/
│
└── README.md                          # This file
```

## Key Architecture Decisions

### 1. Generic Components (Reusable Across All Tournaments)
All components in `/components/` are tournament-agnostic:
- **TournamentPlayPage.jsx**: Main hub component
  - Props: `play` object, `tournamentTitle`, `isLoading`
  - Derives structure from play object (any # of groups, any bracket format)
- **StageCards**: Progress display components
  - GroupsStageCard: `totalGroups` prop (works with 4, 6, 8, 12, etc.)
  - BracketStageCard: `totalMatches` prop (works with any bracket structure)
  - ReviewStageCard: Universal submission interface
- **Modals**: Prediction input modals
  - BracketPredictionModal: Works with any bracket structure
  - ReviewSubmitModal: Works with any prediction data

### 2. Tournament-Specific Wrappers
Each tournament folder contains:
- **Overview Page** (e.g., `WorldCupTournament_2026.jsx`)
  - Shows your plays and pool memberships
  - Allows creating new plays
  - Allows joining pools
  - Tournament-specific UI/branding
  
- **Play Page Wrapper** (e.g., `pages/TournamentPlayPage.jsx`)
  - Thin wrapper that imports generic TournamentPlayPage
  - Provides tournament-specific data and configuration
  - Handles API calls for that tournament's specific endpoints
  - Example:
    ```jsx
    import TournamentPlayPage from '../../../components/TournamentPlayPage';
    import { mockPlay } from '../data/mockPlay';
    
    export default () => (
      <TournamentPlayPage play={mockPlay} tournamentTitle="World Cup 2026" />
    );
    ```

### 3. Data Structures
Only tournament-specific data lives in tournament folders:
- Group definitions (4-12 groups)
- Team lists
- Tournament dates
- Points scoring rules (if different)
- Mock play fixtures for development

## How It Works

### Adding a New Tournament (3 Steps)

**Step 1: Create Wrapper**
```jsx
// /[new-tournament]/pages/TournamentPlayPage.jsx
import TournamentPlayPage from '../../../components/TournamentPlayPage';
import { mockPlay } from '../data/mockPlay';

export default () => (
  <TournamentPlayPage 
    play={mockPlay} 
    tournamentTitle="Tournament Name"
  />
);
```

**Step 2: Create Mock Data**
```js
// /[new-tournament]/data/mockPlay.js
export const mockPlay = {
  id: '1',
  tournament_id: 'euro-2024',
  group_predictions: {
    A: [{position: 1, team_id: null, locked: false}, ...],
    B: [...],
    // 4 groups for Euro, 8 for World Cup, etc.
  },
  bracket_predictions: {
    round_of_16: [...],
    quarterfinals: [...],
    ...
  },
  // ... rest of play structure
};
```

**Step 3: Add Routes**
```jsx
// In main routes file
import EuropeCup from 'features/brackets/europe-cup-2024/EuropeCup2024';
import EuroCupPlay from 'features/brackets/europe-cup-2024/pages/TournamentPlayPage';

routes = [
  { path: '/brackets/euro-2024', element: <EuropeCup /> },
  { path: '/brackets/euro-2024/:userId/:playId', element: <EuroCupPlay /> }
];
```

Done! The generic components handle everything.

## Generic Components in Action

### TournamentPlayPage
- Accepts ANY play object
- Automatically derives:
  - Number of groups (from `group_predictions` keys)
  - Number of bracket matches (from `bracket_predictions` keys)
  - Tournament title (from prop)
- Works identically for all tournaments

### StageCards
```jsx
// Automatically handles different tournament structures
<GroupsStageCard
  totalGroups={Object.keys(play.group_predictions).length}
  onEditClick={handleEdit}
  // ... other props
/>

<BracketStageCard
  totalMatches={getTotalMatches(play.bracket_predictions)}
  onEditClick={handleEdit}
  // ... other props
/>
```

## Data Flow

### Viewing a Tournament Play
```
Browser: /brackets/world-cup-2026/:userId/:playId
    ↓
Route loads TournamentPlayPage wrapper
    ↓
Wrapper fetches play from API (or uses mockPlay)
    ↓
Generic TournamentPlayPage component renders
    ↓
StageCards display with data from play object
    ↓
User sees tournament-agnostic UI
```

### Making Predictions
```
User clicks "Make Predictions"
    ↓
Generic Modal opens (works with any bracket)
    ↓
User selects teams/winners
    ↓  
Click Save
    ↓
POST to API (tournament-specific endpoint)
    ↓
Backend updates Play
    ↓
Page updates with new data
```

## Multi-Tournament Comparison

| Aspect | World Cup 2026 | Euro Cup 2024 | Champions League |
|--------|---|---|---|
| **Groups** | 8 (A-H), 4 teams | 4 (A-D), variable | 8, variable |
| **Bracket** | 32 → Final | 16 → Final | 16 → Final |
| **Total Matches** | 64 | 51 | 125 |
| **Points Max** | 50 groups + 37 bracket | TBD | TBD |
| **Swaps** | Yes (Fibonacci) | TBD | TBD |
| **Location** | `/world-cup-2026/` | `/europe-cup-2024/` | `/champions-league-2026/` |

## Benefits of This Architecture

✅ **Reusability**: Write components once, use for all tournaments  
✅ **Consistency**: Same UI/UX patterns across all tournaments  
✅ **Maintainability**: Bug fixes in generic components update all tournaments  
✅ **Scalability**: Adding tournaments requires minimal code (just wrapper + data)  
✅ **Testing**: Generic components tested against multiple tournament shapes  
✅ **Independence**: Front-end develops with mock data while backend completes setup  

## TODO - Next Steps

- [ ] Implement Europe Cup 2024 wrapper and mock data
- [ ] Implement Champions League 2026 wrapper and mock data
- [ ] Add all tournament routes to main router
- [ ] Create tournament selector/hub page
- [ ] Connect to real API endpoints (replace mockPlay)
- [ ] Add tournament start/end dates to Play model backend
- [ ] Tournament-specific point formulas (if different)
- [ ] Performance: Code-split tournament folders
- [ ] Internationalization for tournament names
├── data/
│   └── worldCup2026Groups.js           # Tournament data (groups and teams)
├── world-cup-2026/                     # Tournament-specific components
│   ├── components/
│   │   ├── WorldCupIntro.jsx           # Intro/showcase component
│   │   └── PlayNameModal.jsx           # Modal to name a new play
│   ├── styles/
│   │   ├── WorldCupIntro.scss
│   │   ├── PlayNameModal.scss
│   │   └── WorldCupTournament_2026.scss
│   └── WorldCupTournament_2026.jsx     # Main tournament component
└── README.md                           # This file
```

## Feature Overview

### User Flow

1. **Intro Phase**: User sees the tournament showcase with a "Make a Play" button
2. **Naming Phase**: User enters a name for their tournament prediction set ("play")
3. **Group Stage**: User predicts the finishing order of teams in each of 8 groups using drag-and-drop
4. **Bracket Stage**: User predicts knockout stage winners (coming soon)
5. **Review**: User reviews all predictions before submitting (coming soon)
6. **Submit**: Play is saved to the database (coming soon)

### Key Features

- **Drag-and-Drop Team Ordering**: Users arrange teams in predicted finishing order
- **Group Navigation**: Swipe left/right or click group buttons to navigate between groups
- **Lock-in System**: Groups can be locked to prevent accidental edits
- **Responsive Design**: Works on desktop and mobile devices
- **State Management**: React hooks manage prediction state and session flow

## Components

### TournamentGroupsModal
Main modal component for group stage predictions.

**Props:**
- `groups`: Object with group data (e.g., WORLD_CUP_2026_GROUPS)
- `groupKeys`: Array of group keys in order
- `predictions`: Current predictions object
- `onUpdatePrediction`: Callback to update team order
- `onLockGroup`: Callback to lock a group
- `onUnlockGroup`: Callback to unlock a group
- `isGroupLocked`: Function to check if group is locked
- `onClose`: Callback when modal is closed
- `onGroupsComplete`: Callback when all groups are locked

**Features:**
- One group displayed at a time
- Swipe gestures for navigation (left/right)
- Toggle buttons to jump to specific groups
- Drag-and-drop team reordering
- Lock/Edit functionality per group
- "Proceed to Bracket" button when all groups locked

### WorldCupIntro
Introductory showcase component with call-to-action button.

**Props:**
- `onStartClick`: Callback when "Make a Play" button is clicked

### PlayNameModal
Modal for naming a new tournament play/prediction set.

**Props:**
- `isOpen`: Boolean to control visibility
- `onConfirm`: Callback with the play name
- `onCancel`: Callback when cancelled

## Hooks

### usePlaySession
Manages the current tournament session and phase flow.

**State:**
- `playName`: Name of current play
- `currentPhase`: Current phase ('intro', 'name', 'groups', 'bracket', 'review', 'submitted')

**Functions:**
- `startNewPlay()`: Initiate new play
- `setPlayNameAndProceed(name)`: Set name and move to groups
- `proceedToBracket()`: Move to bracket prediction phase
- `proceedToReview()`: Move to review phase
- `submitPlay()`: Submit the play
- `resetToIntro()`: Reset to intro

### useGroupPredictions
Manages group stage predictions and locked state.

**State:**
- `predictions`: Object mapping group keys to ordered team ID arrays
- `lockedGroups`: Set of locked group keys
- `allGroupsCompleted`: Boolean indicating all groups have 4 teams selected

**Functions:**
- `updateGroupPrediction(groupKey, orderedTeamIds)`: Update team order for a group
- `lockGroup(groupKey)`: Lock a group
- `unlockGroup(groupKey)`: Unlock a group
- `isGroupLocked(groupKey)`: Check if group is locked
- `resetPredictions()`: Reset all state

### useSwipe
Handles touch swipe gestures for mobile navigation.

**Returns:**
- `handleTouchStart`: Touch start event handler
- `handleTouchEnd`: Touch end event handler

## Data

### worldCup2026Groups.js
Static tournament data containing all 8 groups and their teams.

Each group has:
- `name`: Display name (e.g., "Group A")
- `teams`: Array of team objects with `id`, `name`, and `flag` emoji

## Styling

All components use SCSS with:
- CSS variables for colors (`--color-teal`, `--color-dark`, etc.)
- Mobile-first responsive design
- Smooth transitions and animations
- Consistent visual theme

## Route Configuration

The feature is accessible at: `/tournaments/world-cup-2026`

**Current Status**: UNPROTECTED route for frontend development
**TODO**: Wrap with `<ProtectedRoute>` once authentication is verified:
```jsx
{ 
  path: 'tournaments/world-cup-2026', 
  element: (
    <ProtectedRoute>
      <WorldCupTournament_2026 />
    </ProtectedRoute>
  ) 
}
```

## Next Steps

1. **Bracket Component**: Create bracket/knockout stage prediction component
2. **Review Component**: Create prediction review and submission component
3. **API Integration**: Connect to backend to save plays and predictions
4. **Authentication**: Wrap route with ProtectedRoute to require login
5. **Scoring System**: Implement point calculation logic
6. **Leaderboard**: Display scores and rankings
7. **Additional Tournaments**: Extend framework to support other tournaments

## Development Notes

- All state is client-side. Predictions will be lost on page refresh until backend integration is complete
- The feature uses React Router for navigation
- Touch events are supported for mobile swipe gestures
- Drag-and-drop uses native HTML5 dragstart/dragend/drop events
