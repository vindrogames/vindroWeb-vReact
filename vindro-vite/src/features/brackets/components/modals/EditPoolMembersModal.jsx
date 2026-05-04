import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import poolServices from '../../services/poolServices';

const EditPoolMembersModal = ({ isOpen, poolId, isMoneyPool, leaderboard, onClose, onUpdate }) => {
    const [removing, setRemoving] = useState(new Set());
    const [toggling, setToggling] = useState(new Set());
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleRemove = async (playId) => {
        setRemoving(prev => new Set(prev).add(playId));
        setError('');
        try {
            await poolServices.removePlayFromPool(poolId, playId);
            await onUpdate();
        } catch (err) {
            setError(err.message || 'Failed to remove play.');
        } finally {
            setRemoving(prev => { const s = new Set(prev); s.delete(playId); return s; });
        }
    };

    const handleTogglePaid = async (playId) => {
        setToggling(prev => new Set(prev).add(playId));
        setError('');
        try {
            await poolServices.togglePaid(poolId, playId);
            await onUpdate();
        } catch (err) {
            setError(err.message || 'Failed to update paid status.');
        } finally {
            setToggling(prev => { const s = new Set(prev); s.delete(playId); return s; });
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-overlay-content-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <ShowcaseSection id="edit-pool-members-gallery" className="modal-gallery">
                    <h2>edit<span className="inline-teal inline-bold">Members</span></h2>

                    {leaderboard.length === 0 ? (
                        <p className="no-members-msg">No members yet.</p>
                    ) : (
                        <div className="members-list">
                            {leaderboard.map((item) => (
                                <div key={item.play_id} className="member-row">
                                    <div className="member-info">
                                        <img src={item.user.avatar} alt={item.user.username} className="member-avatar" />
                                        <div className="member-details">
                                            <span className="member-username">{item.user.username}</span>
                                            <span className="member-play-name">{item.play_name}</span>
                                        </div>
                                    </div>
                                    <div className="member-actions">
                                        {isMoneyPool && (
                                            <button
                                                className={`btn paid-toggle ${item.has_paid ? 'btn-teal' : 'btn-gray'}`}
                                                onClick={() => handleTogglePaid(item.play_id)}
                                                disabled={toggling.has(item.play_id) || removing.has(item.play_id)}
                                            >
                                                {toggling.has(item.play_id) ? '...' : item.has_paid ? 'Paid ✓' : 'Unpaid'}
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-gray remove-btn"
                                            onClick={() => handleRemove(item.play_id)}
                                            disabled={removing.has(item.play_id) || toggling.has(item.play_id)}
                                        >
                                            {removing.has(item.play_id) ? '...' : 'Remove'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && <p className="error-message">{error}</p>}
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default EditPoolMembersModal;
