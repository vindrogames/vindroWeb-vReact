import React, { useState } from 'react';

const GroupCard = ({
    groupName,
    teams,
    isOwner,
    isEditable,
    isStageClosed,
    groupPoints,
    onUpdate,
    isEditing,
}) => {
    const [moveHistory, setMoveHistory] = useState({});

    const showBadge = (isEditable || isStageClosed) && isOwner;

    const clearTeamMove = (key) => {
        setMoveHistory(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleMove = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= teams.length) return;

        const newOrder = [...teams];
        const [movedItem] = newOrder.splice(index, 1);
        newOrder.splice(newIndex, 0, movedItem);

        const teamKey = movedItem.id || movedItem.team;
        setMoveHistory(prev => ({
            ...prev,
            [teamKey]: { dir: direction, id: (prev[teamKey]?.id || 0) + 1 },
        }));

        if (typeof onUpdate === 'function') {
            onUpdate(groupName, newOrder);
        }
    };

    return (
        <div className={`group-card ${isOwner ? 'is-editable' : ''}`}>
            <div className={`group-header${!showBadge ? ' stage-not-ready' : ''}`}>
                <p>{groupName}</p>
                {showBadge && (
                    <span className="group-pts">
                        {typeof groupPoints === 'number' ? `${groupPoints} pts` : '— pts'}
                    </span>
                )}
            </div>

            <div className="team-list">
                {teams.map((team, i) => {
                    const teamKey = team.id || team.team;
                    const teamMove = moveHistory[teamKey] || null;
                    const lastMoveDir = teamMove?.dir || null;
                    const moveBtnId = teamMove?.id || 0;
                    return (
                        <div
                            key={teamKey || i}
                            className={`team-row rank-${i + 1} ${isEditing ? 'is-editing' : ''} ${lastMoveDir ? `just-moved-${lastMoveDir}` : ''}`}
                        >
                            <span className="rank-num">{i + 1}</span>
                            <span className={`fi fi-${team.flag?.toLowerCase()} team-flag`}></span>
                            <span className="team-name">{team.team}</span>

                            {isEditable && isEditing && (
                                <div className="reorder-controls">
                                    <button
                                        key={lastMoveDir === 'up' ? `up-${moveBtnId}` : 'up'}
                                        className={`move-btn up${lastMoveDir === 'up' ? ' active' : ''}`}
                                        disabled={i === 0}
                                        onClick={() => handleMove(i, 'up')}
                                        onAnimationEnd={lastMoveDir === 'up' ? () => clearTeamMove(teamKey) : undefined}
                                    >
                                        ▲
                                    </button>
                                    <button
                                        key={lastMoveDir === 'down' ? `down-${moveBtnId}` : 'down'}
                                        className={`move-btn down${lastMoveDir === 'down' ? ' active' : ''}`}
                                        disabled={i === teams.length - 1}
                                        onClick={() => handleMove(i, 'down')}
                                        onAnimationEnd={lastMoveDir === 'down' ? () => clearTeamMove(teamKey) : undefined}
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
