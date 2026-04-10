# World Cup 2026 Bracket Feature

This directory contains the implementation of the bracket prediction feature for the World Cup 2026 tournament.

## Directory Structure

```
brackets/
├── components/                          # Global bracket components (reusable across tournaments)
│   ├── TournamentGroupsModal.jsx       # Main modal for group stage predictions
│   ├── TeamDragHandle.jsx              # Individual team drag handle component
│   ├── styles/
│   │   ├── TournamentGroupsModal.scss
│   │   └── TeamDragHandle.scss
│   └── index.js                        # Component exports
├── hooks/                              # Custom React hooks
│   ├── useSwipe.js                     # Handle swipe gestures
│   ├── useGroupPredictions.js          # Manage group predictions state
│   ├── usePlaySession.js               # Manage tournament session state
│   └── index.js                        # Hook exports
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
