import React, { useState, useRef } from 'react';
import GroupCard from '../../../components/GroupCard';

const WorldCupGroupStage = ({ data, isOwner, isEditable, isStageClosed, groupPoints, onUpdate, onSave, activeEditId, onEditingChange }) => {

    const scrollRef = useRef(null);
    const [editSnapshot, setEditSnapshot] = useState(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;

        const viewport = scrollRef.current;
        const card = viewport.querySelector('.group-card');

        if (card) {
            const cardWidth = card.offsetWidth;
            const gap = parseInt(window.getComputedStyle(viewport).gap) || 0;
            const scrollAmount = cardWidth + gap;

            viewport.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleEditingChange = (groupName, isEditing) => {
        if (isEditing) {
            setEditSnapshot({ groupName, teams: [...data[groupName]] });
        } else {
            setEditSnapshot(null);
        }
        onEditingChange(`group-${groupName}`, isEditing);
    };

    const handleCancelEdit = () => {
        if (editSnapshot) {
            onUpdate(editSnapshot.groupName, editSnapshot.teams);
            setEditSnapshot(null);
        }
        onEditingChange(activeEditId, false);
    };

    if (!data) return null;

    return (
        <div className="gallery-container">
            {/* Use activeEditId to hide arrows */}
            <button className={`nav-arrow left ${activeEditId ? 'hidden' : ''}`} onClick={() => scroll('left')}>‹</button>

            <div className={`viewport ${activeEditId ? 'has-active-focus' : ''}`} ref={scrollRef}>
                {Object.entries(data).map(([groupName, teams]) => {
                    const cardId = `group-${groupName}`;
                    return (
                        <GroupCard
                            key={groupName}
                            groupName={groupName}
                            teams={teams}
                            isOwner={isOwner}
                            isEditable={isEditable}
                            isStageClosed={isStageClosed}
                            groupPoints={groupPoints}
                            onUpdate={onUpdate}
                            onSave={onSave}
                            isDimmed={activeEditId && activeEditId !== cardId}
                            isFocused={activeEditId === cardId}
                            onEditingChange={(isEditing) => handleEditingChange(groupName, isEditing)}
                            onCancel={handleCancelEdit}
                        />
                    );
                })}
            </div>

            <button className={`nav-arrow right ${activeEditId ? 'hidden' : ''}`} onClick={() => scroll('right')}>›</button>
        </div>
    );
};

export default WorldCupGroupStage;
