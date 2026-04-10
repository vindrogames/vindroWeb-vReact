/**
 * JoinPoolModal.jsx
 * 
 * Modal component for joining a tournament pool.
 * Features:
 * - Display the default public "vindroPool"
 * - Input for private pool codes
 * - Security: Rate limiting, code validation, hashed codes in DB
 * 
 * Props:
 *   - userId: Current user's ID
 *   - onClose: Callback when modal is closed
 * 
 * ====================================
 * SECURITY IMPLEMENTATION GUIDE
 * ====================================
 * 
 * BACKEND POOL CODE VALIDATION:
 * 
 * 1. NEVER STORE PLAINTEXT CODES
 *    - Hash all pool codes using bcrypt with salt rounds >= 12
 *    - Format: poolCode = await bcrypt.hash(code, 12)
 *    - Compare: const isMatch = await bcrypt.compare(enteredCode, storedHash)
 * 
 * 2. RATE LIMITING (CRITICAL)
 *    - Max 5 attempts per IP per hour (use Redis or in-memory store)
 *    - Max 3 attempts per session before CAPTCHA required
 *    - Implement exponential backoff: 1s, 2s, 4s, 8s delays
 *    - Lock account for 5 minutes after 5 failed attempts
 * 
 * 3. GENERIC ERROR MESSAGES (Don't reveal if code exists)
 *    - Invalid input → \"Invalid pool code. Please check and try again.\"
 *    - Code not found → \"Invalid pool code. Please check and try again.\"
 *    - User already in pool → \"You're already a member of this pool.\"
 *    - Pool full → \"This pool has reached its member limit.\"
 * 
 * 4. CODE FORMAT & LENGTH
 *    - Requirements: 6-12 alphanumeric characters
 *    - Enforce on frontend AND backend
 *    - Store codes in uppercase for consistency
 * 
 * 5. AUDIT LOGGING
 *    - Log all join attempts: timestamp, userId, IP, code attempt, result
 *    - Monitor for suspicious patterns:
 *      * Sequential code attempts (ABC001, ABC002, ABC003...)
 *      * Rapid attempts from different IPs (potential bot network)
 *      * Timing patterns that suggest automated scanning
 * 
 * 6. ADDITIONAL SECURITY MEASURES
 *    - Add CAPTCHA after 3 failed attempts in a session
 *    - Use JWT tokens for code submission (prevent CSRF)
 *    - Validate user is authenticated before processing
 *    - Add Content Security Policy headers
 *    - Log all successful pool joins with user details
 * 
 * 7. DATABASE CONSIDERATIONS
 *    - Create unique constraint on (userId, poolId) to prevent duplicate joins
 *    - Add indexes on: poolId, userId, createdAt for quick lookups
 *    - Soft delete joins (keep audit trail)
 * 
 * 8. MONITORING & ALERTS
 *    - Alert if same IP attempts >10 codes in 1 hour
 *    - Alert if one code is attempted >20 times in 1 hour
 *    - Alert if user joins >5 pools in <1 minute (possible bot)
 * 
 * EXAMPLE BACKEND IMPLEMENTATION (Node.js):
 * 
 * async function joinPoolWithCode(userId, enteredCode) {
 *   // 1. Rate limit check
 *   const ip = getClientIP(request);
 *   const attempts = await redisClient.get(`pool:attempts:${ip}`);
 *   
 *   if (attempts > 5) {
 *     throw new RateLimitError('Too many attempts. Try again later.');
 *   }
 * 
 *   // 2. Normalize input
 *   const normalizedCode = enteredCode.trim().toUpperCase();
 * 
 *   // 3. Find pool by code hash
 *   const pool = await Pool.findOne({
 *     codeHash: await bcrypt.hash(normalizedCode)
 *   });
 * 
 *   // 4. Generic response (don't reveal if pool exists)
 *   if (!pool) {
 *     await incrementAttempts(ip);
 *     logFailedAttempt(userId, ip, normalizedCode);
 *     throw new InvalidEntryError('Invalid pool code.');
 *   }
 * 
 *   // 5. Check if user already member
 *   const isMember = await PoolMembership.findOne({ 
 *     poolId: pool.id, 
 *     userId 
 *   });
 * 
 *   if (isMember) {
 *     throw new AlreadyMemberError('You\'re already in this pool.');
 *   }
 * 
 *   // 6. Add user to pool
 *   await PoolMembership.create({ poolId: pool.id, userId });
 *   
 *   // 7. Reset rate limit counter
 *   await redisClient.del(`pool:attempts:${ip}`);
 * 
 *   // 8. Log successful join
 *   logSuccessfulJoin(userId, pool.id, ip);
 * 
 *   return { success: true, poolName: pool.name };
 * }
 */

import React, { useState } from 'react';

const JoinPoolModal = ({ userId, onClose }) => {
  const [poolCode, setPoolCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null); // 'vindro' or 'code'

  // Validate pool code format (alphanumeric, 6-12 chars)
  const validatePoolCode = (code) => {
    const trimmedCode = code.trim().toUpperCase();
    
    // Check length
    if (trimmedCode.length < 6) {
      setError('Pool code must be at least 6 characters');
      return false;
    }
    
    if (trimmedCode.length > 12) {
      setError('Pool code must be 12 characters or less');
      return false;
    }
    
    // Check alphanumeric only
    if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
      setError('Pool code must contain only letters and numbers');
      return false;
    }
    
    return trimmedCode;
  };

  const handleJoinPublicPool = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // TODO: API call to backend - See security guide at top of file
      // POST /api/pools/join-public
      // Body: { userId }
      // Expected responses:
      //   - 200: { poolId, poolName, memberCount }
      //   - 409: User already member of pool
      //   - 400: Invalid user or pool full
      
      // const response = await poolAPI.joinPublicPool(userId);
      // if (response.success) onClose();
      
      console.log('Joining public pool: vindroPool');
      onClose();
    } catch (err) {
      setError('Failed to join pool. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCodePool = async () => {
    const validatedCode = validatePoolCode(poolCode);
    if (!validatedCode) return;

    setIsLoading(true);
    setError('');
    
    try {
      // TODO: API call to backend - See COMPREHENSIVE SECURITY IMPLEMENTATION GUIDE at top
      // POST /api/pools/join-code
      // Body: { userId, poolCode: validatedCode }
      // Security CRITICAL requirements:
      //   1. Use bcrypt.compare() with stored hashed code (never plaintext)
      //   2. Implement rate limiting: 5 attempts/IP/hour, 3 per session
      //   3. Lock after 5 failed attempts (5 min timeout)
      //   4. Use GENERIC errors (don't reveal if code exists)
      //   5. Log all attempts (successful + failed) with timestamp, IP, userId
      //   6. Monitor for: sequential attempts, same-code spam, bot patterns
      //   7. Return only: success + poolName, or generic "Invalid pool code" error
      
      // const response = await poolAPI.joinPoolWithCode(userId, validatedCode);
      // if (response.success) {
      //   onClose();
      // } else {
      //   setError(response.error || 'Invalid pool code. Please check and try again.');
      // }
      
      console.log('Joining pool with code:', validatedCode);
      onClose();
    } catch (err) {
      setError('Failed to join pool. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="join-pool-modal-overlay" onClick={onClose}>
      <div className="join-pool-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join a Tournament Pool</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Public Pool Option */}
          {!selectedPool && (
            <>
              <div className="pool-option public-pool" onClick={() => setSelectedPool('vindro')}>
                <div className="pool-icon">🌍</div>
                <div className="pool-info">
                  <h3>Vindro Public Pool</h3>
                  <p>Join the default pool shared by all players</p>
                  <span className="pool-label">Free • Public • No Code Needed</span>
                </div>
                <div className="pool-action">→</div>
              </div>

              <div className="divider">
                <span>OR</span>
              </div>

              {/* Private Pool Option */}
              <div className="pool-option private-pool" onClick={() => setSelectedPool('code')}>
                <div className="pool-icon">🔐</div>
                <div className="pool-info">
                  <h3>Join with Pool Code</h3>
                  <p>Enter a code to join a private pool</p>
                  <span className="pool-label">Friends Only • Requires Code</span>
                </div>
                <div className="pool-action">→</div>
              </div>
            </>
          )}

          {/* Public Pool Confirmation */}
          {selectedPool === 'vindro' && (
            <div className="pool-confirmation">
              <div className="confirmation-icon">✓</div>
              <h3>Join Vindro Public Pool?</h3>
              <p>You'll be added to the public pool where you can compete with all players worldwide.</p>
              <div className="pool-details">
                <div className="detail-item">
                  <span className="label">Pool Type:</span>
                  <span className="value">Public</span>
                </div>
                <div className="detail-item">
                  <span className="label">Members:</span>
                  <span className="value">1,000+</span>
                </div>
                <div className="detail-item">
                  <span className="label">Entry:</span>
                  <span className="value">Free</span>
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
          )}

          {/* Code Pool Input */}
          {selectedPool === 'code' && (
            <div className="pool-code-input">
              <h3>Enter Pool Code</h3>
              <p>Ask your pool organizer for the code</p>
              <input
                type="text"
                className={`pool-code-field ${error ? 'error' : ''}`}
                placeholder="e.g., ABC123XYZ"
                value={poolCode}
                onChange={(e) => {
                  setPoolCode(e.target.value);
                  setError('');
                }}
                maxLength={12}
                autoFocus
                disabled={isLoading}
              />
              <div className="code-hint">
                Format: 6-12 letters and numbers
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="cancel-btn"
            onClick={() => selectedPool ? setSelectedPool(null) : onClose()}
            disabled={isLoading}
          >
            {selectedPool ? 'Back' : 'Cancel'}
          </button>
          <button
            className="confirm-btn"
            onClick={selectedPool === 'vindro' ? handleJoinPublicPool : handleJoinCodePool}
            disabled={selectedPool === 'code' && !poolCode.trim() || isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Pool'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinPoolModal;
