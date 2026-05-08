import React, { useState, useEffect, useRef } from 'react';

const GroupCard = ({
    groupName,
    teams,
    isOwner,
    isEditable,
    isStageClosed,
    groupPoints,
    onUpdate,
    onSave,
    onEditingChange,
    onCancel,
    isDimmed,
    isFocused,
}) => {
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [lastMoved, setLastMoved] = useState(null);
    const cardRef = useRef(null);

    useEffect(() => {
        if (!isFocused) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onCancel?.();
        };
        const handleMouseDown = (e) => {
            if (cardRef.current && !cardRef.current.contains(e.target)) {
                onCancel?.();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [isFocused, onCancel]);

    // Use the isFocused prop to determine if this card is the one being edited
    const isEditing = isFocused;

    const toggleEdit = async () => {
        if (isEditing) {
            // Logic for Saving
            setSaving(true);
            setSaveError(null);
            try {
                await onSave();
                setLastMoved(null);
                if (onEditingChange) onEditingChange(false);
            } catch (err) {
                setSaveError(err.message || 'Failed to save. Try again.');
            } finally {
                setSaving(false);
            }
        } else {
            // Logic for entering Edit mode
            setSaveError(null);
            if (onEditingChange) onEditingChange(true);
        }
    };

    const handleMove = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= teams.length) return;

        const newOrder = [...teams];
        const [movedItem] = newOrder.splice(index, 1);
        newOrder.splice(newIndex, 0, movedItem);

        const teamKey = movedItem.id || movedItem.team;
        setLastMoved({ key: teamKey, dir: direction });

        if (typeof onUpdate === 'function') {
            onUpdate(groupName, newOrder);
        }
    };

    return (
        <div
            ref={cardRef}
            className={`group-card ${isOwner ? 'is-editable' : ''} ${isFocused ? 'focused-edit' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
        >
            {/* Scenario 1 (not_ready): stage-not-ready centers the name; no badge */}
            {/* Scenario 2 (open):      edit button shown for owner              */}
            {/* Scenario 3 (closed):    pts badge shown for owner                */}
            <div className={`group-header${!isEditable && !isStageClosed ? ' stage-not-ready' : ''}`}>
                <p>{groupName}</p>
                {isEditable ? (
                    <button
                        className={`btn btn-tan edit-toggle-btn ${isEditing ? 'active' : ''}`}
                        onClick={toggleEdit}
                        disabled={saving}
                    >
                        {saving ? '...' : isEditing ? 'save' : 'edit'}
                    </button>
                ) : isStageClosed && isOwner && typeof groupPoints === 'number' ? (
                    <span className="group-pts">{groupPoints} pts</span>
                ) : null}
            </div>

            {saveError && (
                <p className="group-card-error">{saveError}</p>
            )}

            <div className="team-list">
                {teams.map((team, i) => {
                        const teamKey = team.id || team.team;
                        const wasMovedDir = lastMoved?.key === teamKey ? lastMoved.dir : null;
                        return (
                            <div
                                key={teamKey || i}
                                className={`team-row rank-${i + 1} ${isEditing ? 'is-editing' : ''} ${wasMovedDir ? `just-moved-${wasMovedDir}` : ''}`}
                            >
                                <span className="rank-num">{i + 1}</span>
                                <span className={`fi fi-${team.flag?.toLowerCase()} team-flag`}></span>
                                <span className="team-name">{team.team}</span>

                                {isEditable && isEditing && (
                                    <div className="reorder-controls">
                                        <button
                                            className={`move-btn up${wasMovedDir === 'up' ? ' active' : ''}`}
                                            disabled={i === 0 || saving}
                                            onClick={() => handleMove(i, 'up')}
                                        >
                                            ▲
                                        </button>
                                        <button
                                            className={`move-btn down${wasMovedDir === 'down' ? ' active' : ''}`}
                                            disabled={i === teams.length - 1 || saving}
                                            onClick={() => handleMove(i, 'down')}
                                        >
                                            ▼
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default GroupCard;
