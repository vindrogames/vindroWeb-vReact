// Single source of truth for bracket round metadata on the frontend.
// Must stay in sync with vindro-django/src/tournament/scoring.py (POINTS_BY_ROUND).
export const POINTS_BY_ROUND = {
  R32: 2,
  R16: 4,
  QF: 8,
  SF: 16,
  '3rd': 16,
  F: 32,
};

export const MATCHES_BY_ROUND = {
  R32: 16,
  R16: 8,
  QF: 4,
  SF: 2,
  '3rd': 1,
  F: 1,
};

export const ROUND_LABELS = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter Finals',
  SF: 'Semi Finals',
  '3rd': '3rd Place',
  F: 'Final',
};

// Max points achievable across the whole bracket (176 for World Cup 2026).
export const MAX_BRACKET_POINTS = Object.entries(POINTS_BY_ROUND)
  .reduce((sum, [round, pts]) => sum + pts * MATCHES_BY_ROUND[round], 0);

/**
 * Calculate the status of a bracket match based on user prediction vs official result.
 * Correctness compares team NAME only, matching backend scoring (scoring.py).
 * @param {Object} match - The match object with id, home, away
 * @param {Object|null} userPick - User's predicted winner {name, flag}
 * @param {Object|null} actualWinner - Official result winner {name, flag}
 * @param {number} pointsPerMatch - Points awarded for correct pick
 * @returns {Object} Status object with class, badge, isCorrect properties
 */
export function getMatchStatus(match, userPick, actualWinner, pointsPerMatch) {
  // Match hasn't been played yet
  if (!actualWinner) {
    return {
      class: 'pending',
      badge: null,
      isCorrect: null,
    };
  }

  // Match played but the user never made a pick — distinct from a wrong pick
  if (!userPick) {
    return {
      class: 'no-pick',
      badge: {
        icon: '—',
        text: 'no pick',
      },
      isCorrect: false,
    };
  }

  const isCorrect = userPick.name === actualWinner.name;

  if (isCorrect) {
    return {
      class: 'correct',
      badge: {
        icon: '✓',
        text: `+${pointsPerMatch} pts`,
      },
      isCorrect: true,
    };
  }

  return {
    class: 'incorrect',
    badge: {
      icon: '✗',
      text: '+0 pts',
    },
    isCorrect: false,
  };
}

/**
 * Check if two teams are the same
 * @param {Object} teamA - First team {name, flag}
 * @param {Object} teamB - Second team {name, flag}
 * @returns {boolean}
 */
export function sameTeam(teamA, teamB) {
  return !!teamA && !!teamB && teamA.name === teamB.name && teamA.flag === teamB.flag;
}

/**
 * Calculate round-by-round breakdown for the score summary.
 * Only matches with a recorded winner count as "decided" — a partially
 * completed round reports earned/max over its decided matches only.
 * @param {Object} bracketPredictions - User's bracket predictions
 * @param {Object} bracketResults - Official bracket results
 * @returns {Array} Array of round summaries
 */
export function calculateRoundBreakdown(bracketPredictions, bracketResults) {
  const breakdown = [];

  for (const [roundKey, pointsPerMatch] of Object.entries(POINTS_BY_ROUND)) {
    const predMatches = bracketPredictions?.[roundKey] || [];
    const resultMatches = bracketResults?.[roundKey] || [];

    // Build result lookup — only matches that actually have a winner
    const resultWinners = {};
    resultMatches.forEach(rm => {
      if (rm.winner) resultWinners[rm.id] = rm.winner;
    });

    const decided = Object.keys(resultWinners).length;

    let correct = 0;
    let earned = 0;

    predMatches.forEach(pm => {
      const actualWinner = resultWinners[pm.id];
      const userPick = pm.winner;

      if (actualWinner && userPick && userPick.name === actualWinner.name) {
        correct++;
        earned += pointsPerMatch;
      }
    });

    const totalMatches = MATCHES_BY_ROUND[roundKey] || predMatches.length;
    const played = decided > 0;

    breakdown.push({
      key: roundKey,
      label: ROUND_LABELS[roundKey],
      correct,
      decided,
      totalMatches,
      earned,
      max: decided * pointsPerMatch,          // points available so far in this round
      roundMax: totalMatches * pointsPerMatch, // points if the whole round were decided
      played,
    });
  }

  return breakdown;
}
