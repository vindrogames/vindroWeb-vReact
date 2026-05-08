import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import poolServices from '../../services/poolServices';

const PoolRemovePlayModal = ({ isOpen, poolId, leaderboard = [], currentUserId, isOwner, onCancel, onSuccess }) => {
    const [selectedPlayIds, setSelectedPlayIds] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Owner sees all plays; member sees only their own
    const removablePlays = isOwner
        ? leaderboard
        : leaderboard.filter(entry => String(entry.user?.id) === String(currentUserId));

    useEffect(() => {
        if (!isOpen) {
            setSelectedPlayIds([]);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleSelection = (playId) => {
        setSelectedPlayIds(prev =>
            prev.includes(playId) ? prev.filter(id => id !== playId) : [...prev, playId]
        );
    };

    const handleConfirm = async () => {
        if (selectedPlayIds.length === 0) return;
        setIsSubmitting(true);
        setError('');
        try {
            await Promise.all(
                selectedPlayIds.map(playId => poolServices.removePlayFromPool(poolId, playId))
            );
            onSuccess();
            onCancel();
        } catch (err) {
            setError(err.message || 'Failed to remove plays.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-overlay-content-container submit-play-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onCancel} disabled={isSubmitting}>&times;</button>

                <ShowcaseSection id="remove-plays-gallery" className="modal-gallery">
                    <h2>remove<span className="inline-neon-pink inline-bold">Plays</span></h2>

                    {removablePlays.length === 0 ? (
                        <p>No plays to remove.</p>
                    ) : (
                        <div className="select-table">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            {isOwner && <th>Player</th>}
                                            <th>Play Name</th>
                                            <th style={{ width: '84px' }}>Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {removablePlays.map((entry) => (
                                            <tr
                                                key={entry.play_id}
                                                className={selectedPlayIds.includes(entry.play_id) ? 'selected-row' : ''}
                                                onClick={() => toggleSelection(entry.play_id)}
                                            >
                                                {isOwner && (
                                                    <td className="play-info-name">
                                                        <div className="member-info">
                                                            <img
                                                                src={entry.user?.avatar || '/img/profile_icons/gray-simple.webp'}
                                                                alt={entry.user?.username}
                                                                className="member-avatar"
                                                            />
                                                            <span>{entry.user?.username}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="play-info-name">{entry.play_name}</td>
                                                <td>
                                                    <div className="checkbox-container">
                                                        <div className={`custom-checkbox ${selectedPlayIds.includes(entry.play_id) ? 'checked' : ''}`}>
                                                            {selectedPlayIds.includes(entry.play_id) && <span>✓</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </ShowcaseSection>

                <ShowcaseSection id="remove-plays-actions">
                    {error && <p className="error-message">{error}</p>}
                    <div className="submit-plays-buttons">
                        <button className="btn btn-tan cancel-btn" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-tan confirm-btn"
                            onClick={handleConfirm}
                            disabled={isSubmitting || selectedPlayIds.length === 0}
                        >
                            {isSubmitting
                                ? 'Removing...'
                                : `Remove ${selectedPlayIds.length} Play${selectedPlayIds.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolRemovePlayModal;
