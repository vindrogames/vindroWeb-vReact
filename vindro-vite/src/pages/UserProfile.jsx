import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../components/pages/users/DataTable';
import SmartLink from '../components/ui/SmartLink';
import { useAuth } from '../contexts/auth/AuthContext';
import { authAPI } from '../contexts/auth/services/authService';
import UserProfileHelmet from '../page-helmets/UserProfileHelmet';

function getIconName(avatarUrl) {
    const match = avatarUrl?.match(/profile_icons\/(.+)\.webp/);
    return match ? match[1] : 'teal-simple';
}

const UserProfile = () => {

    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileNotFound, setProfileNotFound] = useState(false);
    const [bracketSummary, setBracketSummary] = useState([]);

    // True only when the logged-in user is viewing their own profile
    const isOwner = user && String(user.id) === userId;

    const [isEditingUserName, setIsEditingUserName] = useState(false);
    const [isEditingUserIcon, setIsEditingUserIcon] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('teal-simple');
    const [profileError, setProfileError] = useState(null);
    const inputRef = useRef(null);
    const usernameWrapperRef = useRef(null);
    const iconWrapperRef = useRef(null);
    const saveUsernameRef = useRef(null);
    const saveIconRef = useRef(null);

    const colors = ['green', 'orange', 'pink', 'purple', 'teal', 'white'];
    const styles = ['simple', 'black-shades', 'color-shades', 'pirate', 'music', 'office', 'snow'];
    const allIcons = colors.flatMap(color =>
        styles.map(style => `${color}-${style}`)
    );

    // Fetch the profile and bracket summary in parallel
    useEffect(() => {
        let cancelled = false;
        async function loadProfile() {
            setProfileLoading(true);
            setProfileNotFound(false);
            try {
                const [profileData, bracketsData] = await Promise.all([
                    authAPI.getPublicProfile(userId),
                    authAPI.getUserBracketSummary(userId),
                ]);
                if (cancelled) return;
                setProfileUser(profileData.user);
                setEditValue(profileData.user.username || '');
                setSelectedIcon(getIconName(profileData.user.avatar));
                setBracketSummary(bracketsData.data || []);
            } catch {
                if (!cancelled) setProfileNotFound(true);
            } finally {
                if (!cancelled) setProfileLoading(false);
            }
        }
        loadProfile();
        return () => { cancelled = true; };
    }, [userId]);

    // Keep edit fields in sync when the owner's auth context updates after a save
    useEffect(() => {
        if (isOwner) {
            if (user?.username) setEditValue(user.username);
            if (user?.avatar) setSelectedIcon(getIconName(user.avatar));
        }
    }, [user?.username, user?.avatar]);

    useEffect(() => {
        if (isEditingUserName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingUserName]);

    // Silent cancel for username: Escape key or click outside the input wrapper
    useEffect(() => {
        if (!isEditingUserName) return;
        const originalUsername = profileUser?.username;
        const cancel = () => {
            setEditValue(originalUsername || '');
            setProfileError(null);
            setIsEditingUserName(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') cancel();
            if (e.key === 'Enter') saveUsernameRef.current();
        };
        const onDown = (e) => {
            if (usernameWrapperRef.current && !usernameWrapperRef.current.contains(e.target)) cancel();
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onDown);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onDown);
        };
    }, [isEditingUserName]);

    // Silent cancel for avatar gallery: Escape key or click outside the icon wrapper
    useEffect(() => {
        if (!isEditingUserIcon) return;
        const originalIcon = getIconName(profileUser?.avatar);
        const cancel = () => {
            setSelectedIcon(originalIcon);
            setIsEditingUserIcon(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') cancel();
            if (e.key === 'Enter') saveIconRef.current();
        };
        const onDown = (e) => {
            if (e.target.closest?.('.btn-edit')) return;
            if (iconWrapperRef.current && !iconWrapperRef.current.contains(e.target)) cancel();
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onDown);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onDown);
        };
    }, [isEditingUserIcon]);

    const handleEditUserNameToggle = async () => {
        if (isEditingUserName) {
            try {
                setProfileError(null);
                const data = await authAPI.updateProfile({ username: editValue });
                updateUser({ username: data.user.username });
                setProfileUser(prev => ({ ...prev, username: data.user.username }));
            } catch (err) {
                setProfileError(err.message);
                return;
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
                setProfileUser(prev => ({ ...prev, avatar: data.user.avatar }));
            } catch (err) {
                setProfileError(err.message);
                return;
            }
        }
        setIsEditingUserIcon(!isEditingUserIcon);
    };

    // Keep refs current every render so stale-closure effects always call the latest handler
    saveUsernameRef.current = handleEditUserNameToggle;
    saveIconRef.current = handleEditUserIconToggle;

    const providerMap = {
        'google': 'Google',
        'github': 'Git Hub',
    };

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

    const scoreData = [];

    const bracketCols = [
        {
            header: 'Tournament',
            render: (row) => (
                <SmartLink to={`/brackets/${row.tournament_slug}`} className="table-link">
                    {row.tournament_name}
                </SmartLink>
            )
        },
        { header: 'Pools', render: (row) => row.pools_joined },
        { header: 'Plays', render: (row) => row.play_count },
        { header: 'Top Pos.', render: (row) => row.top_position ?? '-' },
    ];

    if (profileLoading) {
        return (
            <main id="user-profile">
                <UserProfileHelmet />
                <div className="profile-container">
                    <p>Loading...</p>
                </div>
            </main>
        );
    }

    if (profileNotFound) {
        return (
            <main id="user-profile">
                <UserProfileHelmet />
                <div className="profile-container">
                    <p>User not found.</p>
                </div>
            </main>
        );
    }

    const handleWelcomeReturn = () => {
        const origin = sessionStorage.getItem('login_origin');
        sessionStorage.removeItem('login_origin');
        navigate(origin || '/');
    };

    const { login_count = 0, provider = 'local', has_edited_username = false } = user || {};
    const fromWelcome = location.state?.fromWelcome === true;

    return (
        <>
            <UserProfileHelmet username={profileUser?.username} />
            <main id="user-profile">

                <div className="profile-container">

                    <div className="profile-header">
                        {!isOwner && (
                            <h1 className="visiting-user">Visiting vindroUser nº <span className='inline-green inline-bold'>{profileUser.id}</span></h1>
                        )}

                        {isOwner && login_count === 1 && (
                            <>
                                <h1 className="welcome-new-user">Welcome vindroUser nº <span className='inline-green inline-bold'>{profileUser.id}</span>!</h1>
                                <div className="welcome-text">
                                    <h2>You can edit your userName and profile icon anytime you like!</h2>
                                    <h2>For the meantime, you have a random userName and the simple-teal icon.</h2>
                                </div>
                                {fromWelcome && (
                                    <button id="return-to-prev-page" className="btn btn-tan" onClick={handleWelcomeReturn}>Where you were</button>
                                )}
                            </>
                        )}

                        {isOwner && login_count > 1 && (
                            <>
                                <h1 className="profile-intro">Hello Friend!</h1>
                                {!has_edited_username && (
                                    <div className="welcome-text">
                                        <h2>Don't forget — you can change your userName and avatar right here!</h2>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <section id="user-name-icon" className={`user-container ${isEditingUserName ? 'focused-mode' : ''}`}>

                        <div className="user-name-data">
                            <h2>user<span className='inline-teal inline-bold'>Name</span></h2>

                            <div className="editable-input-wrapper" ref={usernameWrapperRef}>

                                <div className="input-button-container">
                                    <div className="input-container">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={isEditingUserName ? editValue : profileUser.username}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            readOnly={!isEditingUserName}
                                            className={isEditingUserName ? 'input-active' : 'input-frozen'}
                                            maxLength={21}
                                            spellCheck="false"
                                        />
                                        {isEditingUserName && (
                                            <span className={`char-count${editValue.length >= 21 ? ' at-limit' : ''}`}>
                                                {editValue.length}/21
                                            </span>
                                        )}
                                    </div>
                                    {isOwner && (
                                        <button
                                            className={`${isEditingUserName ? 'input-active' : 'input-frozen'} btn-edit`}
                                            onClick={handleEditUserNameToggle}
                                        >
                                            {isEditingUserName ? 'Save' : 'Edit'}
                                        </button>
                                    )}
                                </div>

                                <div className="profile-error-container">
                                    <p className={`profile-error${profileError ? ' visible' : ''}`}>
                                        {profileError || '-'}
                                    </p>
                                </div>

                            </div>

                            {isOwner && (
                                <>
                                    <div className="user-email">
                                        <h3>Joined with {providerMap[provider] || provider || '-'}</h3>
                                    </div>
                                </>
                            )}

                            <div className="user-joined">
                                <h3>Joined {profileUser.joined ? new Date(profileUser.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'today'}</h3>
                            </div>
                            <div className='user-logins'>
                                <h3>Logged in {login_count || '0'} time{login_count === 1 ? '' : 's'}</h3>
                            </div>


                        </div>

                        <div className="user-icon">
                            <img src={`/img/profile_icons/${selectedIcon}.webp`} alt="User Avatar" />

                            {isOwner && (
                                <button
                                    className={`${isEditingUserIcon ? 'input-active' : 'input-frozen'} btn-edit`}
                                    onClick={handleEditUserIconToggle}
                                >
                                    {isEditingUserIcon ? 'Save' : 'Edit'}
                                </button>
                            )}

                            {isOwner && isEditingUserIcon && (
                                <div className="icon-gallery" ref={iconWrapperRef}>
                                    {allIcons.map((iconName) => (
                                        <button
                                            key={iconName}
                                            className={`gallery-item ${selectedIcon === iconName ? 'selected' : ''}`}
                                            onClick={() => setSelectedIcon(iconName)}
                                            title={iconName}
                                        >
                                            <img src={`/img/profile_icons/${iconName}-96.webp`} alt={iconName} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                    </section>

                    <div className="section-seperator"></div>

                    <section id="user-top-scores" className="user-container">

                        <div className="scores-stats-container">
                            <h4>top<span className='inline-teal inline-bold'>Scores</span></h4>
                            <div className="table-container">
                                <DataTable data={scoreData} columns={scoreCols} emptyMessage="Coming Soon" />
                            </div>
                        </div>

                        <div className="scores-stats-container">
                            <h4>brackets</h4>
                            <div className="table-container">
                                <DataTable data={bracketSummary} columns={bracketCols} tableType="brackets-table" emptyMessage="No bracket data." />
                            </div>
                        </div>

                    </section>
                </div>
            </main>
        </>
    );
}

export default UserProfile;
