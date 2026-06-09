import React, { useState, useRef, useEffect } from 'react';
import GroupCard from '../../../components/GroupCard';

const WorldCupGroupStage = ({ data, isOwner, isEditable, isStageClosed, groupPoints, onUpdate, onSave, onEditingChange, loginBanner, cancelEditRef }) => {

    const scrollRef = useRef(null);
    const [isGalleryEditing, setIsGalleryEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!cancelEditRef) return;
        cancelEditRef.current = () => {
            setIsGalleryEditing(false);
            onEditingChange?.('group-gallery', false);
        };
    });

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const viewport = scrollRef.current;
        const card = viewport.querySelector('.group-card');
        if (card) {
            const cardWidth = card.offsetWidth;
            const gap = parseInt(window.getComputedStyle(viewport).gap) || 0;
            viewport.scrollBy({ left: direction === 'left' ? -(cardWidth + gap) : (cardWidth + gap), behavior: 'smooth' });
        }
    };

    const handleEditClick = () => {
        setIsGalleryEditing(true);
        onEditingChange?.('group-gallery', true);
    };

    const handleSaveClick = async () => {
        setSaving(true);
        try {
            await onSave();
            setIsGalleryEditing(false);
            onEditingChange?.('group-gallery', false);
        } finally {
            setSaving(false);
        }
    };

    if (!data) return null;

    return (
        <div className={`gallery-container${isEditable ? ' is-editable' : ''}${isGalleryEditing ? ' gallery-editing' : ''}`}>

            {loginBanner}

            {isEditable && (
                <button
                    className={`btn btn-tan gallery-edit-btn${isGalleryEditing ? ' active' : ''}`}
                    onClick={isGalleryEditing ? handleSaveClick : handleEditClick}
                    disabled={saving}
                >
                    {saving ? '...' : isGalleryEditing ? 'Save' : 'Edit Groups'}
                </button>
            )}

            <button className="nav-arrow left" onClick={() => scroll('left')}>‹</button>

            <div className="viewport" ref={scrollRef}>
                {Object.entries(data).map(([groupName, teams]) => (
                    <GroupCard
                        key={groupName}
                        groupName={groupName}
                        teams={teams}
                        isOwner={isOwner}
                        isEditable={isEditable}
                        isStageClosed={isStageClosed}
                        groupPoints={groupPoints}
                        onUpdate={onUpdate}
                        isEditing={isGalleryEditing}
                    />
                ))}
            </div>

            <button className="nav-arrow right" onClick={() => scroll('right')}>›</button>
        </div>
    );
};

export default WorldCupGroupStage;
