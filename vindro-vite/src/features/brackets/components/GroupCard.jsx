import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';

const GroupCard = ({ groupName, teams, isOwner, onUpdate, onEditingChange, isDimmed }) => {
    
    const [dragIdx, setDragIdx] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Pure logic to move items in the array
    const reorderTeams = (list, startIndex, endIndex) => {

        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    // Toggle local edit mode and notify parent to handle blur/focus
    const toggleEdit = () => {

        const nextState = !isEditing;
        setIsEditing(nextState);
        if (onEditingChange) {
            onEditingChange(nextState);
        }
    };

    const handleDragStart = (e, index) => {

        // Strict check: Only drag if isOwner AND button was clicked
        if (!isOwner || !isEditing) return;
        setDragIdx(index);
        e.dataTransfer.effectAllowed = "move";

        // Use a timeout so the visual change doesn't interrupt the "grab"
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === index || !isEditing) return;

        const newOrder = reorderTeams(teams, dragIdx, index);
        setDragIdx(index);

        // Send the update to parent hook/state
        if (typeof onUpdate === 'function') {
            onUpdate(groupName, newOrder);
        }
    };

    const handleDragEnd = (e) => {
        setDragIdx(null);
        e.currentTarget.classList.remove('dragging');
        e.target.classList.remove('dragging');
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
                        title={isEditing ? "Save changes" : "Edit predictions"}
                    >
                        {isEditing ? 'save' : 'edit'}
                    </button>
                )}
            </div>

            <div className="team-list">
                {teams.map((team, i) => (
                    <div
                        key={team.id || i}
                        className={`team-row rank-${i + 1} ${isEditing ? 'is-draggable' : ''}`}
                        draggable={isOwner && isEditing}
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDragEnd={handleDragEnd}
                    >
                        <span className="rank-num">{i + 1}</span>
                        <span className={`fi fi-${team.flag} team-flag`}></span>
                        <span className="team-name">{team.team}</span>

                        {/* Drag handle only visible/interactable during Edit Mode */}
                        {isOwner && isEditing && (
                            <span className="drag-handle">≡</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupCard;