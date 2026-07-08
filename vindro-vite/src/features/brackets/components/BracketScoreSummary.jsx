import React from 'react';
import { calculateRoundBreakdown, MAX_BRACKET_POINTS } from '../utils/matchStatus';
import './BracketScoreSummary.scss';

/**
 * Displays a summary bar showing bracket scoring progress by round
 * @param {Object} bracketPredictions - User's bracket predictions
 * @param {Object} bracketResults - Official bracket results from tournament
 * @param {number} totalBracketPoints - Total bracket points earned
 */
export default function BracketScoreSummary({ bracketPredictions, bracketResults, totalBracketPoints }) {
  const breakdown = calculateRoundBreakdown(bracketPredictions, bracketResults);

  // Points available so far = only matches already decided
  const availableSoFar = breakdown.reduce((sum, round) => sum + round.max, 0);

  return (
    <div className="bracket-score-summary">
      <div className="summary-header">
        <h3>Your Bracket Performance</h3>
        <div className="total-score">
          <span className="label">Total Points:</span>
          <span className="value">{totalBracketPoints}</span>
          <span className="max">/ {availableSoFar} so far</span>
          <span className="grand-max">(max {MAX_BRACKET_POINTS})</span>
        </div>
      </div>

      <div className="round-progress">
        {breakdown.map(round => {
          const partial = round.played && round.decided < round.totalMatches;
          return (
            <div key={round.key} className={`round-bar ${round.played ? 'played' : 'pending'}`}>
              <div className="round-label">
                {round.label}
                {partial && <span className="partial-note"> · {round.decided}/{round.totalMatches} matches played</span>}
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${round.played && round.max > 0 ? (round.earned / round.max) * 100 : 0}%` }}
                />
              </div>
              <div className="round-score">
                {round.played ? (
                  <>
                    <span className="earned">{round.earned}</span>
                    <span className="separator"> / </span>
                    <span className="max">{round.max} pts</span>
                    <span className="correct-count">
                      ({round.correct}/{round.decided} correct)
                    </span>
                  </>
                ) : (
                  <span className="not-played">Not played yet</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
