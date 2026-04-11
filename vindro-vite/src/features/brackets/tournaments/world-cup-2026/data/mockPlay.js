/**
 * Mock Play Data for World Cup 2026
 * 
 * Used for frontend development before backend API is ready.
 * Structure matches TournamentPlay model from backend.
 * Replace with actual API calls when backend is implemented.
 */

export const mockPlay = {
  id: 'play-123-abc-def',
  tournament_id: '2026',
  user_id: '123',
  name: 'My Bold Predictions',
  status: 'in_progress',  // 'in_progress' | 'submitted' | 'completed'
  current_phase: 'groups',  // 'groups' | 'bracket' | 'review' | 'submitted'
  
  group_predictions: {
    A: [
      { position: 1, team_id: null, locked: false },
      { position: 2, team_id: null, locked: false },
      { position: 3, team_id: null, locked: false },
      { position: 4, team_id: null, locked: false }
    ],
    B: [
      { position: 1, team_id: null, locked: false },
      { position: 2, team_id: null, locked: false },
      { position: 3, team_id: null, locked: false },
      { position: 4, team_id: null, locked: false }
    ],
    C: [
      { position: 1, team_id: null, locked: false },
      { position: 2, team_id: null, locked: false },
      { position: 3, team_id: null, locked: false },
      { position: 4, team_id: null, locked: false }
    ],
    D: [
      { position: 1, team_id: null, locked: false },
      { position: 2, team_id: null, locked: false },
      { position: 3, team_id: null, locked: false },
      { position: 4, team_id: null, locked: false }
    ],
    E: [
      { position: 1, team_id: null, locked: false },
      { position: 2, team_id: null, locked: false },
      { position: 3, team_id: null, locked: false },
      { position: 4, team_id: null, locked: false }
    ],
    F: [
      { position: 1, team_id: null, locked: false },
      { position: 2, team_id: null, locked: false },
      { position: 3, team_id: null, locked: false },
      { position: 4, team_id: null, locked: false }
    ],
    G: [
      { position: 1, team_id: null, locked: false },
      { position: 2, team_id: null, locked: false },
      { position: 3, team_id: null, locked: false },
      { position: 4, team_id: null, locked: false }
    ],
    H: [
      { position: 1, team_id: null, locked: false },
      { position: 2, team_id: null, locked: false },
      { position: 3, team_id: null, locked: false },
      { position: 4, team_id: null, locked: false }
    ],
  },
  
  bracket_predictions: {
    round_of_32: [
      { match_id: '1', predicted_winner: null },
      { match_id: '2', predicted_winner: null },
      // ... 14 more matches (16 total)
    ],
    round_of_16: [
      { match_id: '17', predicted_winner: null },
      // ... 7 more matches (8 total)
    ],
    quarter_finals: [
      { match_id: '25', predicted_winner: null },
      // ... 3 more matches (4 total)
    ],
    semi_finals: [
      { match_id: '29', predicted_winner: null },
      { match_id: '30', predicted_winner: null },
    ],
    final: [
      { match_id: '31', predicted_winner: null },
    ],
  },
  
  swaps_history: [],
  swaps_used: 0,
  
  groups_points: 0,
  bracket_points: 0,
  total_points: 0,
  
  created_at: '2024-04-11T10:00:00Z',
  updated_at: '2024-04-11T10:00:00Z',
  submitted_at: null,
};

/**
 * FUTURE: Replace this mock data with actual API call:
 * 
 * const fetchPlay = async (playId) => {
 *   const response = await fetch(`/api/plays/${playId}/`);
 *   return response.json();
 * };
 */
