/**
 * Calculate the status of a bracket match based on user prediction vs official result
 * @param {Object} match - The match object with id, home, away
 * @param {Object|null} userPick - User's predicted winner {name, flag}
 * @param {Object|null} actualWinner - Official result winner {name, flag}
 * @param {number} pointsPerMatch - Points awarded for correct pick
 * @returns {Object} Status object with class, badge, text properties
 */
export function getMatchStatus(match, userPick, actualWinner, pointsPerMatch) {
  // Match hasn't been played yet
  if (!actualWinner) {
    return {
      class: 'pending',
      badge: null,
      text: userPick ? `Your pick: ${userPick.name}` : 'No prediction',
      isCorrect: null,
    };
  }

  // Match played - check if user was correct
  const isCorrect = userPick?.name === actualWinner.name;

  if (isCorrect) {
    return {
      class: 'correct',
      badge: {
        icon: '✓',
        text: `+${pointsPerMatch} pts`,
      },
      text: null,  // Visual is enough
      isCorrect: true,
    };
  } else {
    return {
      class: 'incorrect',
      badge: {
        icon: '✗',
        text: '+0 pts',
      },
      text: userPick
        ? `You: ${userPick.name} | Won: ${actualWinner.name}`
        : `Won: ${actualWinner.name}`,
      isCorrect: false,
    };
  }
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
 * Calculate round-by-round breakdown for score summary
 * @param {Object} bracketPredictions - User's bracket predictions
 * @param {Object} bracketResults - Official bracket results
 * @returns {Array} Array of round summaries
 */
export function calculateRoundBreakdown(bracketPredictions, bracketResults) {
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

  const breakdown = [];

  for (const [roundKey, pointsPerMatch] of Object.entries(POINTS_BY_ROUND)) {
    const predMatches = bracketPredictions?.[roundKey] || [];
    const resultMatches = bracketResults?.[roundKey] || [];

    // Build result lookup
    const resultWinners = {};
    resultMatches.forEach(rm => {
      if (rm.winner) resultWinners[rm.id] = rm.winner;
    });

    // Calculate correct picks
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

    const total = resultMatches.length;
    const maxPoints = total * pointsPerMatch;
    const played = total > 0;

    breakdown.push({
      key: roundKey,
      label: ROUND_LABELS[roundKey],
      correct,
      total: played ? total : predMatches.length, // Show predicted count if not played yet
      earned,
      max: played ? maxPoints : (predMatches.length * pointsPerMatch),
      played,
    });
  }

  return breakdown;
}
