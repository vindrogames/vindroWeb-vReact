import React, { useState, useRef } from 'react';
import GroupCard from './GroupCard'; // We will create this next

const GroupStagePredictions = ({ data, isOwner, onUpdate }) => {

    const [focusedGroup, setFocusedGroup] = useState(null);
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        
        if (!scrollRef.current) return;

        const viewport = scrollRef.current;
        const card = viewport.querySelector('.group-card');

        if (card) {
            // Calculate the width of one card + the gap between cards
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
        setFocusedGroup(isEditing ? groupName : null);
    };

    // If Django hasn't returned data yet, don't try to map it
    if (!data) return null;

    return (
        <div className="gallery-container">
            <button className={`nav-arrow left ${focusedGroup ? 'hidden' : ''}`} onClick={() => scroll('left')}>‹</button>

            <div className={`viewport ${focusedGroup ? 'has-active-focus' : ''}`} ref={scrollRef}>
                {/* Object.entries turns { "A": [...], "B": [...] } into an array we can map */}
                {Object.entries(data).map(([groupName, teams]) => (
                    <GroupCard
                        key={groupName}
                        groupName={groupName}
                        teams={teams}
                        isOwner={isOwner}
                        onUpdate={onUpdate}
                        isDimmed={focusedGroup && focusedGroup !== groupName}
                        onEditingChange={(isEditing) => handleEditingChange(groupName, isEditing)}
                    />
                ))}
            </div>

            <button className={`nav-arrow right ${focusedGroup ? 'hidden' : ''}`} onClick={() => scroll('right')}>›</button>
        </div>
    );
};

export default GroupStagePredictions;