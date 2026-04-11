import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const JoinPoolModal = ({ isOpen, tournamentId, userId, onSuccess, onCancel }) => {
  const [poolCode, setPoolCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPoolType, setSelectedPoolType] = useState(null); // 'public' or 'private'
  const [attemptCount, setAttemptCount] = useState(0); // Track failed attempts

  /**
   * Validate pool code format
   * @param {string} code - Code to validate
   * @returns {string|false} Normalized code or false if invalid
   */
  const validatePoolCode = (code) => {
    const trimmedCode = code.trim().toUpperCase();

    // Length validation
    if (trimmedCode.length < 6) {
      setError('Pool code must be at least 6 characters');
      return false;
    }

    if (trimmedCode.length > 12) {
      setError('Pool code must be 12 characters or less');
      return false;
    }

    // Alphanumeric only
    if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
      setError('Pool code must contain only letters and numbers');
      return false;
    }

    return trimmedCode;
  };

  /**
   * Handle joining public vindroPool
   */
  const handleJoinPublicPool = async () => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: POST /api/pools/join-public
      // {
      //   tournament_id: tournamentId,
      //   user_id: userId,
      //   pool_name: 'vindroPool'
      // }

      console.log(`User ${userId} joined public vindroPool for tournament ${tournamentId}`);
      
      // Success callback - parent will close modal
      onSuccess?.('vindroPool', 'vindroPool');
    } catch (err) {
      // Generic error message (don't reveal specific reason)
      setError('Unable to join pool. Please try again.');
      console.error('Join public pool error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle joining private pool with code
   * Includes rate limiting and security checks
   */
  const handleJoinPrivatePool = async () => {
    setError('');
    const normalizedCode = validatePoolCode(poolCode);

    if (!normalizedCode) {
      return;
    }

    // Rate limiting: max 5 attempts before blocking
    if (attemptCount >= 5) {
      setError('Too many attempts. Please try again later.');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: POST /api/pools/join-private
      // {
      //   tournament_id: tournamentId,
      //   user_id: userId,
      //   code: normalizedCode
      // }
      // 
      // BACKEND SHOULD:
      // 1. Hash the code using bcrypt and compare with stored hash
      // 2. Check rate limits per IP (max 5 attempts/hour)
      // 3. Return generic error if code not found
      // 4. Check if user already in pool
      // 5. Check if pool is full
      // 6. Log attempt with timestamp, IP, code (hashed)

      console.log(`User ${userId} attempting to join private pool with code: ${normalizedCode}`);

      // Success callback - parent will close modal
      onSuccess?.(normalizedCode, 'Private Pool');
    } catch (err) {
      // Generic error message (security: don't reveal if code exists)
      setError('Invalid pool code. Please check and try again.');
      
      // Increment attempt counter
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      // Trigger CAPTCHA after 3 failed attempts
      if (newAttemptCount >= 3) {
        console.warn(`Pool join attempts: ${newAttemptCount} - Consider requiring CAPTCHA`);
        // TODO: Show CAPTCHA challenge here
      }

      console.error('Join private pool error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onCancel?.();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="play-name-modal-overlay" onClick={handleClose}>
      <div className="play-name-modal" onClick={(e) => e.stopPropagation()}>
        {/* POOL TYPE SELECTION SCREEN */}
        {!selectedPoolType && (
          <>
            <div className="modal-header">
              <h2>Join a Pool</h2>
              <button
                className="close-btn"
                onClick={handleClose}
                aria-label="Close modal"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Choose how you want to join a pool:
              </p>

              <div className="pool-type-options">
                <button
                  className="pool-option-btn public-pool-btn"
                  onClick={() => setSelectedPoolType('public')}
                  disabled={isLoading}
                >
                  <div className="option-icon">🌍</div>
                  <div className="option-content">
                    <h3>Public Pool</h3>
                    <p>Join vindroPool with one click</p>
                  </div>
                </button>

                <button
                  className="pool-option-btn private-pool-btn"
                  onClick={() => setSelectedPoolType('private')}
                  disabled={isLoading}
                >
                  <div className="option-icon">🔒</div>
                  <div className="option-content">
                    <h3>Private Pool</h3>
                    <p>Enter a code to join a custom pool</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* PUBLIC POOL CONFIRMATION SCREEN */}
        {selectedPoolType === 'public' && (
          <>
            <div className="modal-header">
              <h2>Join Public Pool</h2>
              <button
                className="close-btn"
                onClick={handleClose}
                aria-label="Close modal"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Join the vindroPool to compete with players worldwide.
              </p>

              <div className="pool-info">
                <div className="info-item">
                  <span className="info-label">Pool Name:</span>
                  <span className="info-value">vindroPool</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">Public</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value">Open</span>
                </div>
              </div>

              {error && <p className="error-message">{error}</p>}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setSelectedPoolType(null)}
                disabled={isLoading}
              >
                Back
              </button>
              <button
                className="confirm-btn"
                onClick={handleJoinPublicPool}
                disabled={isLoading}
              >
                {isLoading ? 'Joining...' : 'Join Pool'}
              </button>
            </div>
          </>
        )}

        {/* PRIVATE POOL CODE ENTRY SCREEN */}
        {selectedPoolType === 'private' && (
          <>
            <div className="modal-header">
              <h2>Join Private Pool</h2>
              <button
                className="close-btn"
                onClick={handleClose}
                aria-label="Close modal"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Enter the pool code provided by your pool manager.
              </p>

              <input
                type="text"
                className={`pool-code-input ${error ? 'error' : ''}`}
                placeholder="Enter pool code"
                value={poolCode}
                onChange={(e) => {
                  setPoolCode(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleJoinPrivatePool();
                  }
                }}
                maxLength={12}
                disabled={isLoading}
                autoFocus
              />

              <div className="code-format-hint">
                6-12 characters • Letters and numbers only
              </div>

              {error && <p className="error-message">{error}</p>}

              {attemptCount > 0 && (
                <p className="attempt-warning">
                  Failed attempts: {attemptCount}/5
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setSelectedPoolType(null);
                  setPoolCode('');
                  setError('');
                }}
                disabled={isLoading}
              >
                Back
              </button>
              <button
                className="confirm-btn"
                onClick={handleJoinPrivatePool}
                disabled={isLoading || !poolCode.trim() || attemptCount >= 5}
              >
                {isLoading ? 'Joining...' : 'Join Pool'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default JoinPoolModal;