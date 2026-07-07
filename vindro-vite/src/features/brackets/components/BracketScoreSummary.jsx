import React from 'react';
import { calculateRoundBreakdown } from '../utils/matchStatus';
import './BracketScoreSummary.scss';

/**
 * Displays a summary bar showing bracket scoring progress by round
 * @param {Object} bracketPredictions - User's bracket predictions
 * @param {Object} bracketResults - Official bracket results from tournament
 * @param {number} totalBracketPoints - Total bracket points earned
 */
export default function BracketScoreSummary({ bracketPredictions, bracketResults, totalBracketPoints }) {
  const breakdown = calculateRoundBreakdown(bracketPredictions, bracketResults);

  // Calculate total max possible points
  const totalMaxPoints = breakdown.reduce((sum, round) => sum + round.max, 0);

  return (
    <div className="bracket-score-summary">
      <div className="summary-header">
        <h3>Your Bracket Performance</h3>
        <div className="total-score">
          <span className="label">Total Points:</span>
          <span className="value">{totalBracketPoints}</span>
          <span className="max">/ {totalMaxPoints}</span>
        </div>
      </div>

      <div className="round-progress">
        {breakdown.map(round => (
          <div key={round.key} className={`round-bar ${round.played ? 'played' : 'pending'}`}>
            <div className="round-label">{round.label}</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${round.played ? (round.earned / round.max) * 100 : 0}%` }}
              />
            </div>
            <div className="round-score">
              {round.played ? (
                <>
                  <span className="earned">{round.earned}</span>
                  <span className="separator"> / </span>
                  <span className="max">{round.max} pts</span>
                  <span className="correct-count">
                    ({round.correct}/{round.total} correct)
                  </span>
                </>
              ) : (
                <span className="not-played">Not played yet</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
