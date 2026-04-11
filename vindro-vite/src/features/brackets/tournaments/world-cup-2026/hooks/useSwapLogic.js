/**
 * useSwapLogic.js
 * 
 * Hook for managing bracket prediction swaps
 * Swaps allow users to use their banked group points to correct bracket predictions
 * 
 * Features to implement:
 * - Track swaps_used (0-5 max)
 * - Calculate swap cost using Fibonacci sequence: 3, 5, 8, 13, 21
 * - Calculate remaining bank points
 * - Validate if user has enough points for a swap
 * - Track swap history
 * 
 * TODO: Implement full swap logic once bracket predictions are working
 */

export const useSwapLogic = () => {
  
  // Fibonacci sequence for swap costs
  const SWAP_COSTS = [3, 5, 8, 13, 21];
  
  /**
   * Calculate the cost of the next swap
   * @param {number} swapsUsed - Number of swaps already used
   * @returns {number} Cost of the next swap
   */
  const getSwapCost = (swapsUsed) => {
    if (swapsUsed >= SWAP_COSTS.length) return null; // Max swaps reached
    return SWAP_COSTS[swapsUsed];
  };

  /**
   * Check if user has enough points for a swap
   * @param {number} bankPoints - Available points from groups
   * @param {number} swapsUsed - Swaps already used
   * @returns {boolean} True if user can make another swap
   */
  const canMakeSwap = (bankPoints, swapsUsed) => {
    if (swapsUsed >= SWAP_COSTS.length) return false;
    const cost = getSwapCost(swapsUsed);
    return bankPoints >= cost;
  };

  /**
   * Calculate total points spent on swaps so far
   * @param {number} swapsUsed - Number of swaps used
   * @returns {number} Total points spent
   */
  const getTotalPointsSpent = (swapsUsed) => {
    return SWAP_COSTS.slice(0, swapsUsed).reduce((sum, cost) => sum + cost, 0);
  };

  /**
   * Get all swap information
   * @param {number} bankPoints - Available points from groups
   * @param {number} swapsUsed - Swaps already used
   * @returns {object} Swap details
   */
  const getSwapInfo = (bankPoints, swapsUsed) => {
    return {
      swapsUsed,
      swapsAvailable: SWAP_COSTS.length - swapsUsed,
      currentSwapCost: getSwapCost(swapsUsed),
      canMakeSwap: canMakeSwap(bankPoints, swapsUsed),
      pointsSpent: getTotalPointsSpent(swapsUsed),
      pointsRemaining: bankPoints - getTotalPointsSpent(swapsUsed),
      costSchedule: SWAP_COSTS,
    };
  };

  return {
    getSwapCost,
    canMakeSwap,
    getTotalPointsSpent,
    getSwapInfo,
    SWAP_COSTS,
  };
};

/**
 * EXAMPLE USAGE:
 * 
 * const { getSwapCost, canMakeSwap } = useSwapLogic();
 * 
 * // User has 40 points from groups and has used 2 swaps
 * const cost = getSwapCost(2); // Returns 8
 * const canSwap = canMakeSwap(40, 2); // Returns true (40 >= 8)
 * 
 * // Get full swap info
 * const info = getSwapInfo(40, 2);
 * // Returns: {
 * //   swapsUsed: 2,
 * //   swapsAvailable: 3,
 * //   currentSwapCost: 8,
 * //   canMakeSwap: true,
 * //   pointsSpent: 8,
 * //   pointsRemaining: 32,
 * //   costSchedule: [3, 5, 8, 13, 21]
 * // }
 */
