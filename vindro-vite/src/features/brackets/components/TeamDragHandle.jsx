// Team drag handle component for the groups modal
import React from 'react';

const TeamDragHandle = ({ team, position, isDragging, isDraggable }) => {
    return (
        <div
            className={`team-drag-handle ${isDragging ? 'dragging' : ''} ${!isDraggable ? 'locked' : ''}`}
            draggable={isDraggable}
        >
            <div className="team-handle-content">
                <span className="position-badge">{position}</span>
                <span className="team-flag">{team.flag}</span>
                <span className="team-name">{team.name}</span>
                <span className="drag-indicator">::</span>
            </div>
        </div>
    );
};

export default TeamDragHandle;
