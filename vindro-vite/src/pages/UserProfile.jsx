import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DataTable from '../components/pages/users/DataTable';
import SmartLink from '../components/ui/SmartLink';
import { useAuth } from '../contexts/auth/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { authAPI } from '../contexts/auth/services/authService';
import { gamescoreService } from '../services/gamescoreService';
import { setLanguagePermanent } from '../i18n';

const KNOWN_GAMES = [
    { game_name: 'game-42', display: '42 the Game', slug: 'game-42' },
];
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
    const { t, i18n } = useTranslation('user-profile');
    const { showLoader, hideLoader } = useLoading();

    const [profileUser, setProfileUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileNotFound, setProfileNotFound] = useState(false);
    const [bracketSummary, setBracketSummary] = useState([]);
    const [bestScores, setBestScores] = useState([]);

    const isOwner = user && String(user.id) === userId;

    const [isEditingUserName, setIsEditingUserName] = useState(false);
    const [isEditingUserIcon, setIsEditingUserIcon] = useState(false);
    const [isEditingLang, setIsEditingLang] = useState(false);
    const [selectedLang, setSelectedLang] = useState(i18n.language);
    const [editValue, setEditValue] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('teal-simple');
    const [profileError, setProfileError] = useState(null);
    const inputRef = useRef(null);
    const usernameWrapperRef = useRef(null);
    const iconWrapperRef = useRef(null);
    const langWrapperRef = useRef(null);
    const saveUsernameRef = useRef(null);
    const saveIconRef = useRef(null);
    const saveLangRef = useRef(null);

    const colors = ['green', 'orange', 'pink', 'purple', 'teal', 'white'];
    const styles = ['simple', 'black-shades', 'color-shades', 'pirate', 'music', 'office', 'snow'];
    const allIcons = colors.flatMap(color =>
        styles.map(style => `${color}-${style}`)
    );

    useEffect(() => {
        let cancelled = false;
        async function loadProfile() {
            setProfileLoading(true);
            setProfileNotFound(false);
            try {
                const [profileData, bracketsData, scoresData] = await Promise.all([
                    authAPI.getPublicProfile(userId),
                    authAPI.getUserBracketSummary(userId),
                    gamescoreService.getUserBestScores(userId).catch(() => null),
                ]);
                if (cancelled) return;
                setProfileUser(profileData.user);
                setEditValue(profileData.user.username || '');
                setSelectedIcon(getIconName(profileData.user.avatar));
                setBracketSummary(bracketsData.data || []);
                setBestScores(scoresData?.data?.best_scores || []);
            } catch {
                if (!cancelled) setProfileNotFound(true);
            } finally {
                if (!cancelled) setProfileLoading(false);
            }
        }
        loadProfile();
        return () => { cancelled = true; };
    }, [userId]);

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

    // Keep selectedLang in sync if changed externally (footer/header toggle)
    useEffect(() => {
        setSelectedLang(i18n.language);
    }, [i18n.language]);

    useEffect(() => {
        if (!isEditingLang) return;
        const cancel = () => {
            setSelectedLang(i18n.language);
            setIsEditingLang(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') cancel();
            if (e.key === 'Enter') saveLangRef.current();
        };
        const onDown = (e) => {
            if (langWrapperRef.current && !langWrapperRef.current.contains(e.target)) cancel();
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onDown);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onDown);
        };
    }, [isEditingLang]);

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

    const handleEditLangToggle = async () => {
        if (isEditingLang) {
            showLoader();
            await setLanguagePermanent(selectedLang);
            hideLoader();
        }
        setIsEditingLang(prev => !prev);
    };

    saveUsernameRef.current = handleEditUserNameToggle;
    saveIconRef.current = handleEditUserIconToggle;
    saveLangRef.current = handleEditLangToggle;

    const providerMap = {
        'google': 'Google',
        'github': 'Git Hub',
    };

    const locale = i18n.language === 'spng' ? 'es-ES' : 'en-GB';

    const bestByGame = Object.fromEntries(bestScores.map(s => [s.game_name, s]));

    const scoreData = KNOWN_GAMES.map(game => ({
        game_name: game.game_name,
        display: game.display,
        slug: game.slug,
        best_score: bestByGame[game.game_name]?.best_score ?? null,
        best_time: bestByGame[game.game_name]?.best_time ?? null,
    }));

    const scoreCols = [
        {
            header: t('table.game'),
            render: (row) => (
                <SmartLink to={`/games/${row.slug}`} className="table-link">
                    {row.display}
                </SmartLink>
            )
        },
        { header: t('table.score'), render: (row) => row.best_score !== null ? row.best_score : '-' },
        { header: t('table.time'), render: (row) => row.best_time !== null ? `${row.best_time}s` : '-' },
    ];

    const bracketCols = [
        {
            header: t('table.tournament'),
            render: (row) => (
                <SmartLink to={`/brackets/${row.tournament_slug}`} className="table-link">
                    {row.tournament_name}
                </SmartLink>
            )
        },
        { header: t('table.pools'), render: (row) => row.pools_joined },
        { header: t('table.plays'), render: (row) => row.play_count },
        { header: t('table.topPos'), render: (row) => row.top_position ?? '-' },
    ];

    if (profileLoading) {
        return (
            <main id="user-profile">
                <UserProfileHelmet />
                <div className="profile-container">
                    <p>{t('loading')}</p>
                </div>
            </main>
        );
    }

    if (profileNotFound) {
        return (
            <main id="user-profile">
                <UserProfileHelmet />
                <div className="profile-container">
                    <p>{t('notFound')}</p>
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

    const joinedDate = profileUser.joined
        ? new Date(profileUser.joined).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
        : t('joinedToday');

    const loginsKey = login_count === 1 ? 'logins' : 'loginsPlural';

    return (
        <>
            <UserProfileHelmet username={profileUser?.username} />
            <main id="user-profile">

                <div className="profile-container">

                    <div className="profile-header">
                        {!isOwner && (
                            <h1 className="visiting-user">{t('visiting')} <span className='inline-green inline-bold'>{profileUser.id}</span></h1>
                        )}

                        {isOwner && login_count === 1 && (
                            <>
                                <h1 className="welcome-new-user">{t('welcome.new')} <span className='inline-green inline-bold'>{profileUser.id}</span>!</h1>
                                <div className="welcome-text">
                                    <h2>{t('welcome.editHint')}</h2>
                                    <h2>{t('welcome.defaultsHint')}</h2>
                                </div>
                                {fromWelcome && (
                                    <button id="return-to-prev-page" className="btn btn-tan" onClick={handleWelcomeReturn}>{t('welcome.whereBefore')}</button>
                                )}
                            </>
                        )}

                        {isOwner && login_count > 1 && (
                            <>
                                <h1 className="profile-intro">{t('returning.greeting')}</h1>
                                {!has_edited_username && (
                                    <div className="welcome-text">
                                        <h2>{t('returning.editReminder')}</h2>
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
                                <div className="user-email">
                                    <h3>{t('provider')} {providerMap[provider] || provider || '-'}</h3>
                                </div>
                            )}

                            <div className="user-joined">
                                <h3>{t('joined')} {joinedDate}</h3>
                            </div>
                            <div className='user-logins'>
                                <h3>{t(loginsKey, { count: login_count || 0 })}</h3>
                            </div>

                        </div>

                        <div className="user-icon">
                            <img src={`/img/profile_icons/${selectedIcon}.webp`} alt={t('avatarAlt')} />

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

                    {isOwner && (
                        <section id="user-preferred-lang" className="user-container">
                            <div className="user-name-data">
                                <h2>{t('lang.label')}<span className='inline-teal inline-bold'>{t('lang.labelHighlight')}</span></h2>

                                <div className="editable-input-wrapper" ref={langWrapperRef}>
                                    <div className="input-button-container">
                                        <div className="input-container">
                                            {isEditingLang ? (
                                                <select
                                                    className="input-active"
                                                    value={selectedLang}
                                                    onChange={(e) => setSelectedLang(e.target.value)}
                                                >
                                                    <option value="en">{t('lang.en')}</option>
                                                    <option value="spng">{t('lang.spng')}</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={selectedLang === 'en' ? t('lang.en') : t('lang.spng')}
                                                    readOnly
                                                    className="input-frozen"
                                                />
                                            )}
                                        </div>
                                        <button
                                            className={`${isEditingLang ? 'input-active' : 'input-frozen'} btn-edit`}
                                            onClick={handleEditLangToggle}
                                        >
                                            {isEditingLang ? 'Save' : 'Edit'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <section id="user-top-scores" className="user-container">

                        <div className="scores-stats-container">
                            <h4>top<span className='inline-teal inline-bold'>{t('scores.titleHighlight')}</span></h4>
                            <div className="table-container">
                                <DataTable data={scoreData} columns={scoreCols} emptyMessage={t('scores.empty')} />
                            </div>
                        </div>

                        <div className="scores-stats-container">
                            <h4>brackets</h4>
                            <div className="table-container">
                                <DataTable data={bracketSummary} columns={bracketCols} tableType="brackets-table" emptyMessage={t('brackets.empty')} />
                            </div>
                        </div>

                    </section>
                </div>
            </main>
        </>
    );
};

export default UserProfile;
