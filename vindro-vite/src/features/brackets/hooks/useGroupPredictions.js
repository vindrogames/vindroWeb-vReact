// Custom hook for managing group stage predictions
import { useState, useCallback } from 'react';
import { GROUP_KEYS } from '../data/worldCup2026Groups';

/**
 * Manages the state of group stage predictions
 * Structure: { groupKey: [team1_id, team2_id, team3_id, team4_id] }
 * Where the array represents the predicted finishing order (1st, 2nd, 3rd, 4th)
 */
export const useGroupPredictions = () => {
  // Initialize predictions as empty for all groups
  const initialPredictions = GROUP_KEYS.reduce((acc, groupKey) => {
    acc[groupKey] = [];
    return acc;
  }, {});

  const [predictions, setPredictions] = useState(initialPredictions);
  const [lockedGroups, setLockedGroups] = useState(new Set());

  // Update the prediction order for a specific group
  const updateGroupPrediction = useCallback((groupKey, orderedTeamIds) => {
    setPredictions((prev) => ({
      ...prev,
      [groupKey]: orderedTeamIds,
    }));
  }, []);

  // Lock a group's prediction (prevents editing until unlocked)
  const lockGroup = useCallback((groupKey) => {
    setLockedGroups((prev) => new Set([...prev, groupKey]));
  }, []);

  // Unlock a group's prediction for editing
  const unlockGroup = useCallback((groupKey) => {
    setLockedGroups((prev) => {
      const newSet = new Set(prev);
      newSet.delete(groupKey);
      return newSet;
    });
  }, []);

  // Check if a group is locked
  const isGroupLocked = useCallback((groupKey) => {
    return lockedGroups.has(groupKey);
  }, [lockedGroups]);

  // Check if all groups have predictions
  const allGroupsCompleted = GROUP_KEYS.every((groupKey) => predictions[groupKey].length === 4);

  // Reset all predictions
  const resetPredictions = useCallback(() => {
    setPredictions(initialPredictions);
    setLockedGroups(new Set());
  }, []);

  return {
    predictions,
    lockedGroups,
    updateGroupPrediction,
    lockGroup,
    unlockGroup,
    isGroupLocked,
    allGroupsCompleted,
    resetPredictions,
  };
};
