import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DataTable from '../components/pages/users/DataTable';
import SmartLink from '../components/ui/SmartLink';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

function getIconName(avatarUrl) {
    const match = avatarUrl?.match(/profile_icons\/(.+)\.webp/);
    return match ? match[1] : 'teal-simple';
}

const UserProfile = () => {

    const { userId } = useParams();
    const { user, updateUser } = useAuth();

    const [isEditingUserName, setIsEditingUserName] = useState(false);
    const [isEditingUserIcon, setIsEditingUserIcon] = useState(false);
    const [editValue, setEditValue] = useState(user?.username || "");
    const [selectedIcon, setSelectedIcon] = useState(() => getIconName(user?.avatar));
    const [profileError, setProfileError] = useState(null);
    const inputRef = useRef(null);

    // Array of all available icon names (6 colors × 7 styles = 42 icons)
    const colors = ['green', 'orange', 'pink', 'purple', 'teal', 'white'];
    const styles = ['simple', 'black-shades', 'color-shades', 'pirate', 'music', 'office', 'snow'];
    const allIcons = colors.flatMap(color =>
        styles.map(style => `${color}-${style}`)
    );

    // Sync state when user data loads
    useEffect(() => {
        if (user?.username) setEditValue(user.username);
        if (user?.avatar) setSelectedIcon(getIconName(user.avatar));
    }, [user?.username, user?.avatar]);

    // 2. Force Focus ONLY via Edit Button
    useEffect(() => {
        if (isEditingUserName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingUserName]);

    const handleEditUserNameToggle = async () => {
        if (isEditingUserName) {
            try {
                setProfileError(null);
                const data = await authAPI.updateProfile({ username: editValue });
                updateUser({ username: data.user.username });
            } catch (err) {
                setProfileError(err.message);
                return; // Keep editing mode open on error
            }
        }
        setIsEditingUserName(!isEditingUserName);
    };

    const handleEditUserIconToggle = async () => {
        if (isEditingUserIcon) {
            try {
                setProfileError(null);
                const data = await authAPI.updateProfile({ avatar: selectedIcon });
                updateUser({ avatar: data.user.avatar });
            } catch (err) {
                setProfileError(err.message);
                return; // Keep editing mode open on error
            }
        }
        setIsEditingUserIcon(!isEditingUserIcon);
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
                <SmartLink to={`/user/${userId}/brackets/${row.id}`} className="table-link">
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
                    <h1 className="profile-intro">Hello Friend!</h1>

                    {/* Error feedback */}
                    {profileError && (
                        <p className="profile-error">{profileError}</p>
                    )}

                    {/* User Name + Profile Icon */}
                    <div id="user-name-icon" className={`user-stat-container ${isEditingUserName ? 'focused-mode' : ''}`}>

                        <div className="user-name-data">
                            <h2>user<span className='inline-teal inline-bold'>Name</span></h2>

                            <div className="editable-input-wrapper">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    readOnly={!isEditingUserName}
                                    className={isEditingUserName ? 'input-active' : 'input-frozen'}
                                    spellCheck="false"
                                />
                                <button className={`${isEditingUserName ? 'input-active' : 'input-frozen'} btn-edit`} onClick={handleEditUserNameToggle}>
                                    {isEditingUserName ? (
                                        'Save'
                                    ) : (
                                        'Edit'
                                    )}
                                </button>
                            </div>

                            <div className="user-email">
                                <h3>{user.email ? user.email : 'email@email.com'}</h3>
                            </div>

                            <div className="user-joined">
                                <h3>joined {user.joined ? new Date(user.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'today'}</h3>
                            </div>

                        </div>

                        <div className="user-icon">
                            <img src={`/img/profile_icons/${selectedIcon}.webp`} alt="User Avatar" />

                            <button className={`${isEditingUserIcon ? 'input-active' : 'input-frozen'} btn-edit`} onClick={handleEditUserIconToggle}>
                                {isEditingUserIcon ? (
                                    'Save'
                                ) : (
                                    'Edit'
                                )}
                            </button>

                            {isEditingUserIcon && (
                                <div className="icon-gallery">
                                    {allIcons.map((iconName) => (
                                        <button
                                            key={iconName}
                                            className={`gallery-item ${selectedIcon === iconName ? 'selected' : ''}`}
                                            onClick={() => setSelectedIcon(iconName)}
                                            title={iconName}
                                        >
                                            <img src={`/img/profile_icons/${iconName}.webp`} alt={iconName} />
                                        </button>
                                    ))}
                                </div>
                            )}
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

export default UserProfile;