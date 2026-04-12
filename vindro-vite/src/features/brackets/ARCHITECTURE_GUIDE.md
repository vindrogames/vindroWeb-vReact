/**
 * TOURNAMENT PLAY ARCHITECTURE GUIDE
 * 
 * This document explains the complete flow and structure of the
 * World Cup 2026 tournament play experience.
 * 
 * ========================================================================
 * USER JOURNEY
 * ========================================================================
 * 
 * 1. User starts a new tournament play
 *    - WorldCupTournament_2026.jsx (handleNewPlay)
 *    - Creates Play record with empty predictions
 *    - Navigates to /brackets/:tournamentId/:userId/:playId
 * 
 * 2. User lands on TournamentPlayPage
 *    - Main hub showing all three stages in parallel
 *    - Shows progress for Groups, Bracket, and Review
 *    - User can click any stage card to enter that prediction interface
 * 
 * 3. User makes group predictions
 *    - Click "Make Predictions" on GroupsStageCard
 *    - Opens TournamentGroupsModal (existing component)
 *    - Select team for each position in each group
 *    - Lock groups when finished
 *    - Returns to TournamentPlayPage
 * 
 * 4. Bracket stage becomes available
 *    - BracketStageCard unlocks after all groups are locked
 *    - User clicks "Make Predictions"
 *    - Opens BracketPredictionModal (new component)
 *    - Select winners for each bracket match (31 total)
 *    - Option to use swaps (costs group points)
 *    - Returns to TournamentPlayPage
 * 
 * 5. User reviews all predictions
 *    - Click "Review Play" on ReviewStageCard
 *    - Opens ReviewSubmitModal (new component)
 *    - Shows summary of all predictions
 *    - Double-confirmation before final submission
 *    - Predictions become locked, no more edits
 * 
 * ========================================================================
 * DATA FLOW
 * ========================================================================
 * 
 * PLAY OBJECT STRUCTURE (from mockPlay.js):
 * {
 *   id: string,
 *   tournament_id: string,
 *   user_id: string,
 *   name: string,                          // User-chosen name for this play
 *   status: 'draft' | 'submitted',         // Draft until final submission
 *   current_phase: 'groups' | 'bracket' | 'review',  // Current stage
 *   
 *   // GROUPS STAGE
 *   group_predictions: {
 *     A: [                                 // 8 groups (A-H)
 *       { position: 1, team_id: null, locked: false },  // 4 positions per group
 *       { position: 2, team_id: null, locked: false },
 *       { position: 3, team_id: null, locked: false },
 *       { position: 4, team_id: null, locked: false },
 *     ],
 *     B: [...],
 *     ...
 *   },
 *   groups_points: 0,                      // Points earned from groups
 *   
 *   // BRACKET STAGE
 *   bracket_predictions: {
 *     round_of_32: [                       // 31 matches total
 *       { match_id: 0, team_ids: [id1, id2], prediction: null, locked: false },
 *       ...
 *     ],
 *     round_of_16: [...],                  // 4 matches
 *     quarterfinals: [...],                // 2 matches
 *     semifinals: [...],                   // 1 match
 *     final: [...],                        // 1 match
 *   },
 *   bracket_points: 0,                     // Points earned from bracket
 *   
 *   // SWAPS (for bracket corrections)
 *   swaps_used: 0,                         // Number of swaps consumed
 *   swaps_history: [                       // Log of all swaps made
 *     { match_id: 0, old_prediction: id1, new_prediction: id2, cost: 3 },
 *   ],
 *   
 *   // POINTS & STATUS
 *   total_points: 0,                       // groups_points + bracket_points
 *   created_at: timestamp,
 *   updated_at: timestamp,
 *   submitted_at: null,                    // Set when status = 'submitted'
 * }
 * 
 * ========================================================================
 * COMPONENT STRUCTURE
 * ========================================================================
 * 
 * HUB PAGE: TournamentPlayPage
 * ├─ Header Section
 * │  ├─ Tournament Name
 * │  ├─ Play Name & Phase Badge
 * │  └─ Points Display (Groups | Bracket | Total)
 * │
 * ├─ Stage Cards (Parallel Display)
 * │  ├─ GroupsStageCard
 * │  │  ├─ Progress Bar (0-8 locked)
 * │  │  ├─ Status Label
 * │  │  └─ "Make Predictions" / "Review" Button
 * │  │
 * │  ├─ BracketStageCard
 * │  │  ├─ Lock Status (until groups complete)
 * │  │  ├─ Match Progress (0-31)
 * │  │  ├─ Countdown to Bracket Start (if applicable)
 * │  │  └─ "Make Predictions" Button
 * │  │
 * │  └─ ReviewStageCard
 * │     ├─ Lock Status (until all stages complete)
 * │     ├─ Submission Status
 * │     └─ "Review & Submit" Button
 * │
 * └─ Modal Layer (Only one open at a time)
 *    ├─ TournamentGroupsModal (existing)
 *    ├─ BracketPredictionModal (new)
 *    └─ ReviewSubmitModal (new)
 * 
 * ========================================================================
 * STAGE CARD PROPS & BEHAVIOR
 * ========================================================================
 * 
 * GroupsStageCard
 *   Props:
 *   - groupsCompleted: boolean (all 8 groups locked)
 *   - lockedGroupCount: number (0-8)
 *   - totalGroups: number (always 8)
 *   - onEditClick: function (opens modal)
 *   - isLoading: boolean
 *   
 *   Behavior:
 *   - Shows progress bar percentage
 *   - Button text changes: "Make Predictions" → "Review/Edit Groups"
 *   - After all locked: Status shows "Complete"
 * 
 * BracketStageCard
 *   Props:
 *   - groupsCompleted: boolean (unlocks bracket)
 *   - bracketStarted: boolean (affects countdown display)
 *   - matchesCompleted: number (0-31)
 *   - totalMatches: number (always 31)
 *   - onEditClick: function (opens modal)
 *   - isLoading: boolean
 *   
 *   States:
 *   1. LOCKED: Groups not complete → "Complete groups first"
 *   2. READY: Groups done, bracket hasn't started → "Make predictions"
 *   3. IN PROGRESS: Bracket active → Show match progress, countdown faded
 * 
 * ReviewStageCard
 *   Props:
 *   - allStagesComplete: boolean (both groups & bracket done)
 *   - isSubmitted: boolean (play status = 'submitted')
 *   - onReviewClick: function (opens modal)
 *   - isLoading: boolean
 *   
 *   States:
 *   1. LOCKED: Not all stages complete → "Complete all stages"
 *   2. READY: All done, not submitted → "Review & Submit"
 *   3. SUBMITTED: Play is submitted → "✓ Submitted"
 * 
 * ========================================================================
 * MODAL FLOW & INTEGRATION
 * ========================================================================
 * 
 * TournamentGroupsModal (Existing)
 *   - Props: groups, groupKeys, predictions, handlers...
 *   - Controls: useGroupPredictions hook
 *   - Updates: group_predictions in Play object
 *   - Callback: onGroupsComplete → navigates to bracket phase
 * 
 * BracketPredictionModal (New)
 *   - Props: predictions, groupsPoints, swapsUsed, onSave, onClose
 *   - Controls: useSwapLogic hook for swap calculations
 *   - Features:
 *     • Round-by-round match selection
 *     • Swap panel showing available swaps and costs
 *     • Confidence indicator (locked vs editable)
 *   - Updates: bracket_predictions in Play object
 *   - Callback: onSave → stays in modal for more edits or close
 * 
 * ReviewSubmitModal (New)
 *   - Props: play, onSubmit, onClose
 *   - Display: Full prediction summary with points
 *   - Features:
 *     • Show which pools this play is in
 *     • Summary cards for each stage
 *     • Progress bars for visual confirmation
 *     • Double-click confirmation
 *   - Update: POST to /api/plays/{playId}/submit
 *   - Callback: onSubmit → marks play as submitted, locks all predictions
 * 
 * ========================================================================
 * HOOKS USAGE
 * ========================================================================
 * 
 * useGroupPredictions (Existing)
 *   - Manages group prediction state
 *   - Methods: updateGroupPrediction, lockGroup, unlockGroup
 *   - Used by: TournamentGroupsModal
 *   - NOT needed in TournamentPlayPage (modal handles it)
 * 
 * useSwapLogic (New)
 *   - Pure calculation hook, no state
 *   - Methods: getSwapCost, canMakeSwap, getSwapInfo
 *   - Used by: BracketPredictionModal
 *   - No React hooks inside, just pure functions
 * 
 * useParams (React Router)
 *   - Extract: playId, userId, tournamentId from URL
 *   - Used by: TournamentPlayPage (TODO)
 *   - Import: import { useParams } from 'react-router-dom'
 * 
 * ========================================================================
 * POINTS CALCULATION
 * ========================================================================
 * 
 * GROUPS STAGE (max 50 points)
 *   - 1st place in group: 5 points
 *   - 2nd place in group: 3 points
 *   - 3rd place in group: 1 point
 *   - 4th place in group: 0 points
 *   - 8 groups × max 5 = 50 points total
 * 
 * BRACKET STAGE (max 50 points)
 *   - Round of 32 correct: 1 point each (8 matches max)
 *   - Round of 16 correct: 2 points each (4 matches max)
 *   - Quarterfinals correct: 3 points each (2 matches max)
 *   - Semifinals correct: 5 points each (1 match max)
 *   - Final correct: 10 points
 *   - Total: 8+8+6+5+10 = 37 max (actual depends on structure)
 * 
 * SWAPS
 *   - Cost groups_points to correct bracket predictions
 *   - Fibonacci schedule: 3, 5, 8, 13, 21 (up to 5 swaps)
 *   - Swap 1 costs 3 points, Swap 2 costs 5 points, etc.
 *   - Total max cost: 3+5+8+13+21 = 50 points
 * 
 * ========================================================================
 * API ENDPOINTS (Backend)
 * ========================================================================
 * 
 * GET /api/plays/{playId}/
 *   Returns full Play object with all predictions
 *   Replace mockPlay with this call
 * 
 * PATCH /api/plays/{playId}/
 *   Update play with group predictions
 *   Body: { current_phase: 'bracket', group_predictions: {...} }
 * 
 * PATCH /api/plays/{playId}/bracket-predictions
 *   Update play with bracket predictions
 *   Body: { bracket_predictions: {...} }
 * 
 * POST /api/plays/{playId}/swaps
 *   Record a swap action
 *   Body: { match_id: 0, old_prediction: id1, new_prediction: id2 }
 * 
 * POST /api/plays/{playId}/submit
 *   Final submission - locks all predictions
 *   Response: { status: 'submitted', submitted_at: timestamp }
 * 
 * ========================================================================
 * STATE MANAGEMENT
 * ========================================================================
 * 
 * TournamentPlayPage maintains:
 *   - showGroupsModal: boolean
 *   - showBracketModal: boolean
 *   - showReviewModal: boolean
 * 
 * These are simple toggle states. Actual prediction data stays in:
 *   - play object (mockPlay initially, API later)
 *   - useGroupPredictions hook (groups only)
 * 
 * Child modals manage:
 *   - TournamentGroupsModal: group selection state
 *   - BracketPredictionModal: match selection state
 *   - ReviewSubmitModal: confirmation state
 * 
 * ========================================================================
 * MOBILE CONSIDERATIONS
 * ========================================================================
 * 
 * - Stage cards stack vertically on small screens
 * - Modals should be full-screen or fixed height with scroll
 * - Bracket match grid needs horizontal scroll on mobile
 * - Swap panel stays visible (sticky or scrollable)
 * - Points display should remain at top of modals
 * 
 * ========================================================================
 * ACCESSIBILITY FEATURES
 * ========================================================================
 * 
 * - All buttons have aria-labels
 * - Double-confirmation prevents accidental submission
 * - Progress bars have aria-valuenow and aria-valuemax
 * - Swap cost clearly labeled and disabled when unavailable
 * - Phase badge color-coded: Groups=blue, Bracket=green, Review=gold
 * - Modal backdrop is modal-only (focus management)
 * 
 * ========================================================================
 * TESTING STRATEGY
 * ========================================================================
 * 
 * Unit Tests:
 * - useSwapLogic calculations (pure functions)
 * - useGroupPredictions state management
 * - Component rendering with various props
 * 
 * Integration Tests:
 * - Modal opening/closing flow
 * - Stage card unlock logic
 * - Points calculation across stages
 * - API mocking with mockPlay
 * 
 * E2E Tests (with backend):
 * - Full user journey from play start to submission
 * - Swap functionality with point deductions
 * - Concurrent plays (multiple tabs)
 * - Submit→lock→view flow
 * 
 * ========================================================================
 * PERFORMANCE OPTIMIZATION
 * ========================================================================
 * 
 * - useCallback for modal handlers to prevent re-renders
 * - useMemo for lockedGroupCount calculation if list is large
 * - Code-split modals (lazy load on first open)
 * - Virtual scrolling for bracket round lists (large on mobile)
 * - Debounce API saves (auto-save while editing)
 * 
 * ========================================================================
 * FUTURE ENHANCEMENTS
 * ========================================================================
 * 
 * 1. Undo/Redo for all predictions
 * 2. Comparison view (compare with other users' plays)
 * 3. Tiebreaker rules (if needed for final rankings)
 * 4. Leaderboard integration (real-time points sync)
 * 5. Export/Share predictions (PNG/PDF)
 * 6. Prediction analytics (most popular predictions per match)
 * 7. Mobile app native implementation
 * 8. Prediction validation (warn about unlikely outcomes)
 * 9. Team stats integration (show odds or recent form)
 * 10. Custom play sharing (invite friends to shared play)
 */
