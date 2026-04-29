import React, { useState } from 'react';

const GroupCard = ({ groupName, teams, isOwner, onUpdate, onSave, onEditingChange, isDimmed }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const toggleEdit = async () => {
        if (isEditing) {
            setSaving(true);
            setSaveError(null);
            try {
                await onSave();
                setIsEditing(false);
                if (onEditingChange) onEditingChange(false);
            } catch (err) {
                setSaveError(err.message || 'Failed to save. Try again.');
            } finally {
                setSaving(false);
            }
        } else {
            setSaveError(null);
            setIsEditing(true);
            if (onEditingChange) onEditingChange(true);
        }
    };

    const handleMove = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= teams.length) return;

        const newOrder = [...teams];
        const [movedItem] = newOrder.splice(index, 1);
        newOrder.splice(newIndex, 0, movedItem);

        if (typeof onUpdate === 'function') {
            onUpdate(groupName, newOrder);
        }
    };

    return (
        <div className={`
            group-card
            ${isOwner ? 'is-editable' : ''}
            ${isEditing ? 'focused-edit' : ''}
            ${isDimmed ? 'is-dimmed' : ''}
        `}>
            <div className="group-header">
                <p>{groupName}</p>
                {isOwner && (
                    <button
                        className={`btn btn-tan edit-toggle-btn ${isEditing ? 'active' : ''}`}
                        onClick={toggleEdit}
                        disabled={saving}
                    >
                        {saving ? '...' : isEditing ? 'save' : 'edit'}
                    </button>
                )}
            </div>

            {saveError && (
                <p className="group-card-error">{saveError}</p>
            )}

            <div className="team-list">
                {teams.map((team, i) => (
                    <div
                        key={team.id || i}
                        className={`team-row rank-${i + 1} ${isEditing ? 'is-editing' : ''}`}
                    >
                        <span className="rank-num">{i + 1}</span>
                        <span className={`fi fi-${team.flag?.toLowerCase()} team-flag`}></span>
                        <span className="team-name">{team.team}</span>

                        {isOwner && isEditing && (
                            <div className="reorder-controls">
                                <button
                                    className="move-btn up"
                                    disabled={i === 0 || saving}
                                    onClick={() => handleMove(i, 'up')}
                                >
                                    ▲
                                </button>
                                <button
                                    className="move-btn down"
                                    disabled={i === teams.length - 1 || saving}
                                    onClick={() => handleMove(i, 'down')}
                                >
                                    ▼
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupCard;
