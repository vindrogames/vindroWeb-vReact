import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DataTable from '../components/pages/users/DataTable';
import SmartLink from '../components/ui/SmartLink';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile() {
    
    const { userName: urlParamName } = useParams();
    const { user } = useAuth(); // Cheat Mode Data

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(urlParamName || "");
    const inputRef = useRef(null);

    // 1. Sync input with Cheat Mode User
    useEffect(() => {
        if (user?.username) {
            setEditValue(user.username);
        }
    }, [user?.username]);

    // 2. Force Focus ONLY via Edit Button
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleEditToggle = () => {
        if (isEditing) {
            console.log("Cheat Mode Save: New Username is", editValue);
        }
        setIsEditing(!isEditing);
    };

    // --- Table Data Definitions ---

    const scoreCols = [
        {
            header: 'Game',
            render: (row) => (
                <SmartLink to={`/games/${row.slug}`} className="table-link">
                    {row.game}
                </SmartLink>
            )
        },
        { header: 'Score', render: (row) => row.score.toLocaleString() },
        { header: 'Rank', key: 'rank' },
    ];

    const scoreData = [
        { id: 1, slug: 'escape-the-cloud', game: 'Escape The Cloud', score: 1250, rank: '#4' },
        { id: 2, slug: 'game-42', game: 'Game 42', score: 42, rank: '#1' }
    ];

    const bracketCols = [
        { 
            header: 'Event', 
            render: (row) => (
                <SmartLink to={`/user/${editValue}/brackets/${row.id}`} className="table-link">
                    {row.name}
                </SmartLink>
            )
        },
        { header: 'Status', key: 'status' }
    ];

    const bracketData = [
        { id: 'm1', name: 'Madrid Open', status: 'Active' },
        { id: 'v1', name: 'Vindro Cup', status: 'Finished' }
    ];

    return (
        <>
            

            <main id="user-profile">
                <div className="profile-container">

                    {/* Header Section */}
                    <div id="user-name-intro" className={`user-stat-container ${isEditing ? 'focused-mode' : ''}`}>
                        <h1>Hello Friend!</h1>
                        <h2>user<span className='inline-teal inline-bold'>Name</span></h2>
                        
                        <div className="editable-input-wrapper">
                            <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                readOnly={!isEditing}
                                className={isEditing ? 'input-active' : 'input-frozen'}
                                spellCheck="false"
                            />
                            <button className={`${isEditing ? 'input-active' : 'input-frozen'} btn-edit`} onClick={handleEditToggle}>
                                {isEditing ? (
                                    'Save'
                                ) : (
                                    'Edit'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Tables Section - These are blocked by the overlay when editing */}
                    <div id="user-top-scores" className="user-stat-container">
                        <h3>top<span className='inline-teal inline-bold'>Scores</span></h3>
                        <div className="table-container">
                            <DataTable data={scoreData} columns={scoreCols} />
                        </div>
                    </div>

                    <div id="user-brackets" className="user-stat-container">
                        <h3>brackets</h3>
                        <div className="table-container">
                            <DataTable data={bracketData} columns={bracketCols} />
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}