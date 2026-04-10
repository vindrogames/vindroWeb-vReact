/**
 * TournamentGroupsModal
 * 
 * A modal component that allows users to set their predictions for tournament groups.
 * Features:
 * - Display one group at a time
 * - Swipe left/right to navigate between groups
 * - Toggle buttons to jump to specific groups
 * - Drag and drop teams to reorder them (predict finishing positions)
 * - Lock-in groups to prevent accidental changes
 * - Edit button to unlock locked groups
 * 
 * Props:
 *   - groups: Object containing group data (e.g., WORLD_CUP_2026_GROUPS)
 *   - groupKeys: Array of group keys in order
 *   - onClose: Callback when modal is closed
 *   - onGroupsComplete: Callback when all groups are locked and ready
 */

import React, { useState, useCallback } from 'react';
import TeamDragHandle from './TeamDragHandle';
import { useSwipe } from '../hooks/useSwipe';

const TournamentGroupsModal = ({
    groups,
    groupKeys,
    predictions,
    onUpdatePrediction,
    onLockGroup,
    onUnlockGroup,
    isGroupLocked,
    onClose,
    onGroupsComplete,
}) => {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [draggedTeamId, setDraggedTeamId] = useState(null);

    const currentGroupKey = groupKeys[currentGroupIndex];
    const currentGroup = groups[currentGroupKey];
    const currentPrediction = predictions[currentGroupKey] || [];
    const locked = isGroupLocked(currentGroupKey);

    // Get teams in order from prediction, or original order if no prediction yet
    const orderedTeams = currentPrediction.length > 0
        ? currentPrediction.map((teamId) =>
            currentGroup.teams.find((t) => t.id === teamId)
        )
        : [...currentGroup.teams];

    // Navigation handlers
    const goToPrevious = useCallback(() => {
        if (currentGroupIndex > 0) {
            setCurrentGroupIndex(currentGroupIndex - 1);
        }
    }, [currentGroupIndex]);

    const goToNext = useCallback(() => {
        if (currentGroupIndex < groupKeys.length - 1) {
            setCurrentGroupIndex(currentGroupIndex + 1);
        }
    }, [currentGroupIndex, groupKeys.length]);

    const goToGroup = useCallback((index) => {
        setCurrentGroupIndex(index);
    }, []);

    // Swipe handlers
    const { handleTouchStart, handleTouchEnd } = useSwipe(goToNext, goToPrevious);

    // Drag and drop handlers
    const handleDragStart = useCallback(
        (e, teamId) => {
            if (locked) {
                e.preventDefault();
                return;
            }
            setDraggedTeamId(teamId);
            e.dataTransfer.effectAllowed = 'move';
        },
        [locked]
    );

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback(
        (e, targetTeamId) => {
            e.preventDefault();
            if (!draggedTeamId || locked) return;

            // Create new order by swapping
            const newOrder = [...orderedTeams];
            const draggedIndex = newOrder.findIndex((t) => t.id === draggedTeamId);
            const targetIndex = newOrder.findIndex((t) => t.id === targetTeamId);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                [newOrder[draggedIndex], newOrder[targetIndex]] = [
                    newOrder[targetIndex],
                    newOrder[draggedIndex],
                ];
            }

            const newPrediction = newOrder.map((t) => t.id);
            onUpdatePrediction(currentGroupKey, newPrediction);
            setDraggedTeamId(null);
        },
        [draggedTeamId, locked, orderedTeams, currentGroupKey, onUpdatePrediction]
    );

    const handleDragEnd = useCallback(() => {
        setDraggedTeamId(null);
    }, []);

    // Lock/Edit handlers
    const handleLockIn = useCallback(() => {
        if (currentPrediction.length === 4) {
            onLockGroup(currentGroupKey);
        }
    }, [currentGroupKey, currentPrediction.length, onLockGroup]);

    const handleEdit = useCallback(() => {
        onUnlockGroup(currentGroupKey);
    }, [currentGroupKey, onUnlockGroup]);

    const handleCompleteAll = useCallback(() => {
        onGroupsComplete();
    }, [onGroupsComplete]);

    return (
        <div className="tournament-groups-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
                {/* Header */}
                <div className="modal-header">
                    <h2>Group Stage Predictions</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                {/* Group display area with swipe support */}
                <div
                    className="group-display-area"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="group-header">
                        <h3>{currentGroup.name}</h3>
                        <span className="group-counter">
                            {currentGroupIndex + 1} / {groupKeys.length}
                        </span>
                    </div>

                    {/* Teams list - draggable */}
                    <div className="teams-container">
                        {orderedTeams.map((team, index) => (
                            <div
                                key={team.id}
                                className="team-wrapper"
                                onDragStart={(e) => handleDragStart(e, team.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, team.id)}
                                onDragEnd={handleDragEnd}
                            >
                                <TeamDragHandle
                                    team={team}
                                    position={index + 1}
                                    isDragging={draggedTeamId === team.id}
                                    isDraggable={!locked}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="group-actions">
                        {!locked ? (
                            <button
                                className="lock-btn"
                                onClick={handleLockIn}
                                disabled={currentPrediction.length !== 4}
                            >
                                Lock in Predictions
                            </button>
                        ) : (
                            <button className="edit-btn" onClick={handleEdit}>
                                Edit Predictions
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation - Arrows and group toggle buttons */}
                <div className="navigation">
                    <button
                        className="nav-btn prev-btn"
                        onClick={goToPrevious}
                        disabled={currentGroupIndex === 0}
                        aria-label="Previous group"
                    >
                        ← Prev
                    </button>

                    {/* Group toggle buttons */}
                    <div className="group-toggles">
                        {groupKeys.map((key, index) => (
                            <button
                                key={key}
                                className={`group-toggle ${index === currentGroupIndex ? 'active' : ''} ${isGroupLocked(key) ? 'locked' : ''
                                    }`}
                                onClick={() => goToGroup(index)}
                                title={`Go to ${groups[key].name}`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>

                    <button
                        className="nav-btn next-btn"
                        onClick={goToNext}
                        disabled={currentGroupIndex === groupKeys.length - 1}
                        aria-label="Next group"
                    >
                        Next →
                    </button>
                </div>

                {/* Complete button - appears when all groups are locked */}
                <div className="modal-footer">
                    <button
                        className="complete-btn"
                        onClick={handleCompleteAll}
                        disabled={groupKeys.some((key) => !isGroupLocked(key))}
                    >
                        All Groups Complete - Proceed to Bracket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TournamentGroupsModal;
