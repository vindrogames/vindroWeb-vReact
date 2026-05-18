import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import playServices from '../services/playServices';
import poolServices from '../services/poolServices';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';
import formatDate from '../../../utils/dateFormatter';
import ErrorDisplayModal from '../../../components/ui/ErrorDisplayModal';
import PlayPageHelmet from '../../../page-helmets/PlayPageHelmet';
import WorldCupGroupStage from '../tournaments/world-cup-2026/stages/WorldCupGroupStage';
import WorldCupBracketStage from '../tournaments/world-cup-2026/stages/WorldCupBracketStage';
import DescriptionDropdown from '../components/DescriptionDropdown';
import JoinPoolModal from '../components/modals/PoolJoinModal';
import { EVENT_MAP } from '../tournaments/eventMap';

const STAGE_MAP = {
    'world-cup-2026': {
        GroupStage: WorldCupGroupStage,
        BracketStage: WorldCupBracketStage,
    },
};

const toErrorCode = (err) => {
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('403') || msg.includes('permission') || msg.includes('forbidden')) return 'unauthorized';
    if (msg.includes('401') || msg.includes('authentication')) return 'unauthorized';
    if (msg.includes('404') || msg.includes('not found')) return 'not_found';
    return 'server_error';
};

const startCountdown = (targetDateString, setTime, closedLabel = 'Closed') => {
    const target = new Date(targetDateString);

    function tick() {
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) {
            setTime(closedLabel);
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTime(
            `${days}d ${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`
        );
    }

    tick();
    return setInterval(tick, 1000);
};

const PlayPage = () => {

    const { tournament, userId, playName } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation('play');

    const { user } = useAuth();
    const { showLoader, hideLoader } = useLoading();

    const eventConfig = EVENT_MAP[tournament];
    const [playData, setPlayData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState('');
    const [bracketOpenCountdown, setBracketOpenCountdown] = useState('');
    const [bracketCloseCountdown, setBracketCloseCountdown] = useState('');
    const [errorCode, setErrorCode] = useState(null);

    const [showJoinPoolModal, setShowJoinPoolModal] = useState(false);
    const [myPlays, setMyPlays] = useState([]);

    const [activeTab, setActiveTab] = useState('play');
    const [playPools, setPlayPools] = useState([]);
    const [playPoolsLoading, setPlayPoolsLoading] = useState(false);

    // The "Master Switch": holds the ID of whatever is being edited
    const [activeEditId, setActiveEditId] = useState(null);
    const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
    const [bracketDropdownOpen, setBracketDropdownOpen] = useState(false);
    const dropdownOpen = groupDropdownOpen || bracketDropdownOpen;

    // ── STAGE GATES ─────────────────────────────────────────────────────────────
    // Three scenarios per stage: not_ready | open | closed
    // A stage is "not_ready" when no close date has been set on the play data.
    // To manually force a scenario, comment out the derived lines and set directly:
    //   not_ready → const isGroupOpen = false; const isGroupClosed = false;
    //   open      → const isGroupOpen = true;  const isGroupClosed = false;
    //   closed    → const isGroupOpen = false; const isGroupClosed = true;
    const groupStageConfigured = !!playData?.group_stage_close_date;
    const isGroupOpen = groupStageConfigured && new Date() < new Date(playData.group_stage_close_date);
    const isGroupClosed = groupStageConfigured && !isGroupOpen;

    // Bracket: 3 scenarios based on bracket_open_date and bracket_stage_close_date
    const bracketOpenDate = playData?.bracket_open_date;
    const bracketCloseDate = playData?.bracket_stage_close_date;
    const isBracketNotYet = !!bracketOpenDate && new Date() < new Date(bracketOpenDate);
    const isBracketOpen = !!bracketOpenDate && !isBracketNotYet && !!bracketCloseDate && new Date() < new Date(bracketCloseDate);
    const isBracketClosed = !!bracketCloseDate && !isBracketNotYet && !isBracketOpen;

    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        const fetchPlay = async () => {
            try {
                setLoading(true);
                // OPTION 2: fetch by tournament slug + user ID + play name (shareable URL)
                const result = await playServices.getPlayByUserAndName(tournament, userId, playName);
                if (result && result.success) {
                    setPlayData(result.data);
                } else {
                    setPlayData(null);
                }
                // [UUID fetch — kept for reference, superseded by getPlayByUserAndName]
                // const result = await playServices.getPlayById(playId);
            } catch (error) {
                setErrorCode(toErrorCode(error));
            } finally {
                setLoading(false);
            }
        };
        fetchPlay();
    }, [tournament, userId, playName]);

    const isOwner =
        playData &&
        user &&
        String(playData.user) === String(user.id);

    // Fetch the logged-in user's plays so they can submit one to a pool from this page
    useEffect(() => {
        if (!user || !playData?.tournament_id) return;
        playServices.getUserPlays(playData.tournament_id)
            .then(res => setMyPlays(res?.data || []))
            .catch(() => setMyPlays([]));
    }, [user, playData?.tournament_id]);

    // Fetch pool submissions for this specific play (owner only)
    const refreshPlayPools = () => {
        if (!isOwner || !playData?.tournament_id) return;
        setPlayPoolsLoading(true);
        poolServices.getUserPools(playData.tournament_id)
            .then(res => {
                const all = res?.data || [];
                setPlayPools(all.filter(p => p.play_name === playData.name));
            })
            .catch(() => setPlayPools([]))
            .finally(() => setPlayPoolsLoading(false));
    };

    useEffect(() => {
        refreshPlayPools();
    }, [isOwner, playData?.tournament_id, playData?.name]);

    // Group stage countdown — always running so the "Closed" signal fires automatically
    useEffect(() => {
        if (!playData?.group_stage_close_date) return;
        const interval = startCountdown(playData.group_stage_close_date, setCountdown, t('groupStage.closedLabel'));
        return () => clearInterval(interval);
    }, [playData?.group_stage_close_date]);

    // Bracket scenario 1 — countdown to bracket opening
    useEffect(() => {
        if (!isBracketNotYet || !bracketOpenDate) return;
        const interval = startCountdown(bracketOpenDate, setBracketOpenCountdown, t('bracketStage.closedLabel'));
        return () => clearInterval(interval);
    }, [isBracketNotYet, bracketOpenDate]);

    // Bracket scenario 2 — countdown to bracket closing
    useEffect(() => {
        if (!isBracketOpen || !bracketCloseDate) return;
        const interval = startCountdown(bracketCloseDate, setBracketCloseCountdown, t('bracketStage.closedLabel'));
        return () => clearInterval(interval);
    }, [isBracketOpen, bracketCloseDate]);

    // isEditable = owner AND the relevant stage is still open
    const isGroupEditable = isOwner && isGroupOpen;

    const isBracketEditing = activeEditId?.startsWith('bk-');
    const isGroupEditing = !!activeEditId && !isBracketEditing;

    const stages = STAGE_MAP[tournament] ?? {};
    const { GroupStage, BracketStage } = stages;

    if (loading) {
        return <div className="bracket-tournament-play page-loading">{t('loading')}</div>;
    }

    if (!playData) return <Navigate to="/404" replace />;

    const avatarUrl = playData?.user_avatar || '';

    const colorMap = {
        pink: '#ff2edcff',
        green: '#b4ff00ff',
        orange: '#D97706',
        purple: '#a020f0',
        teal: '#66FCF1',
        white: '#ffffff',
    };

    const matchedKey = Object.keys(colorMap).find(c =>
        avatarUrl.toLowerCase().includes(c)
    );

    const borderColor = colorMap[matchedKey] || 'transparent';

    const handleUpdateGroupOrder = (groupName, newOrder) => {
        setPlayData(prevData => {
            if (!prevData) return prevData;
            return {
                ...prevData,
                group_predictions: {
                    ...prevData.group_predictions,
                    [groupName]: newOrder
                }
            };
        });
    };

    const handleSaveGroup = async () => {
        showLoader();
        try {
            const result = await playServices.updateGroupPredictions(playData.id, playData.group_predictions);
            if (result?.success) {
                setPlayData(prev => ({ ...prev, updated_at: result.data.updated_at }));
            }
        } catch (err) {
            setErrorCode(toErrorCode(err));
        } finally {
            hideLoader();
        }
    };

    // This function is passed down to all children
    const handleEditingChange = (elementId, isEditing) => {
        setActiveEditId(isEditing ? elementId : null);
    };

    return (
        <main id="play-page" className={`play-pool ${activeEditId ? 'has-active-focus' : ''}${dropdownOpen ? ' dropdown-active' : ''}`}>

            <PlayPageHelmet playName={playData.name} tournamentName={playData.tournament_name || tournament} />

            <section className={`play-pool-intro hero-half bg-black${activeEditId ? ' is-dimmed' : ''}`}>
                <div className="play-pool-intro-wrapper">
                    <div className="text-container">
                        <h1 className="profile-intro">
                            {eventConfig
                                ? <>{eventConfig.title.before}<span className="inline-bold inline-teal">{eventConfig.title.highlight}</span>{eventConfig.title.after}</>
                                : (playData.tournament_name || tournament)
                            }
                        </h1>
                        <div className="play-specs">
                            {!isOwner ? (
                                <>
                                    <h2>
                                        <span className='inline-teal'>{t('intro.playLabel')} </span>
                                        <span className="inline-bold">{playData.name}</span>
                                        {' '}<span className="inline-teal">{t('intro.byLabel')}</span>{' '}
                                        <span className="inline-bold">{playData.user_name}</span>
                                    </h2>
                                    <button
                                        className="avatar-link-btn"
                                        style={{ borderBottom: `2px solid ${borderColor}` }}
                                        onClick={() => navigate(`/user/${playData.user}`)}
                                    >
                                        <img src={playData.user_avatar} alt={playData.user_name} />
                                    </button>
                                </>
                            ) : (
                                <h2>
                                    <span className="inline-teal inline-bold">{t('intro.playLabel')}</span>{' '}
                                    <span>{playData.name}</span>
                                </h2>
                            )}
                        </div>

                    </div>

                    <div className="go-back-button-container">
                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>Back</button>
                    </div>
                </div>

                {/* ── TAB NAV — owner only ── */}
                {isOwner && (
                    <nav className="play-tab-nav">

                        <div className="buttons-container">
                            <button
                                className={activeTab === 'play' ? 'active' : ''}
                                onClick={() => setActiveTab('play')}
                            >
                                {t('tabs.play')}
                            </button>
                            <button
                                className={activeTab === 'inPools' ? 'active' : ''}
                                onClick={() => setActiveTab('inPools')}
                            >
                                {t('tabs.inPools')} ({playPools.length})
                            </button>
                        </div>
                    </nav>
                )}
            </section>



            {/* ── STAGES WRAPPER ── */}
            {(!isOwner || activeTab === 'play') && (
                <div className="play-stages-wrapper play-pool-toggle-wrapper">

                    {/* ── GROUP STAGE ── */}

                    {GroupStage && (
                        <section id="groups-predictions" className={`play-prediction-container${isBracketEditing ? ' is-dimmed' : ''}${bracketDropdownOpen ? ' peer-dropdown-active' : ''}`}>

                            <div className="prediction-display-intro">

                                <div className={`title-container-wrapper ${isGroupEditing ? ' is-dimmed' : ''}`}>
                                    <h3>group<span className="inline-teal inline-bold">Stage</span></h3>
                                    <h4>pts: {playData?.group_points || '-'}</h4>
                                </div>

                                <div id="play-description" className={`description-container${isGroupEditing ? ' is-dimmed' : ''}`}>
                                    <DescriptionDropdown summary={t('groupStage.dropdownSummary')} onOpenChange={setGroupDropdownOpen}>
                                        <h4>{t('groupStage.hint1')}</h4>
                                        <h4>{t('groupStage.hint2')}</h4>
                                        <h4>{t('groupStage.hint3')}</h4>
                                        <h4>{t('groupStage.hint4')}</h4>
                                        <h4>{t('groupStage.hint5')}</h4>
                                    </DescriptionDropdown>

                                    <div className="right-container">
                                        {/* Scenario 1 (not_ready): no status line */}
                                        {isGroupOpen && (
                                            <>
                                                <p className="tournament-status-line"><span className="inline-teal">{t('groupStage.openLabel')}</span> {t('groupStage.forPredictions')}</p>
                                                <p className="tournament-status-spacer"> · </p>
                                                <p className="tournament-status-line">
                                                    {t('groupStage.closesIn')} <span className="inline-real-yellow inline-bold">{countdown}</span>
                                                </p>
                                            </>
                                        )}
                                        {isGroupClosed && (
                                            <p>
                                                <span className="inline-neon-pink">{t('groupStage.closedLabel')}</span> {t('groupStage.forPredictions')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="prediction-display-content-wrapper">
                                <GroupStage
                                    data={playData.group_predictions}
                                    isOwner={isOwner}
                                    isEditable={isGroupEditable}
                                    isStageClosed={isGroupClosed}
                                    activeEditId={activeEditId}
                                    onEditingChange={handleEditingChange}
                                    groupPoints={playData.group_points}
                                    onUpdate={handleUpdateGroupOrder}
                                    onSave={handleSaveGroup}
                                />

                                <div className={`last-updated${isGroupEditing ? ' is-dimmed' : ''}`}>
                                    <p className="last-updated group-stage">{t('lastUpdated')} {formatDate(playData.updated_at)}</p>
                                </div>
                            </div>


                        </section>
                    )}

                    {/* ── BRACKET STAGE ── */}
                    {BracketStage && (
                        <section id="bracket-predictions" className={`play-prediction-container${activeEditId && !isBracketEditing ? ' is-dimmed' : ''}${groupDropdownOpen ? ' peer-dropdown-active' : ''}`}>

                            <div className="prediction-display-intro ">
                                <div className={`title-container-wrapper ${isGroupEditing ? ' is-dimmed' : ''}`}>
                                    <h3>bracket<span className="inline-teal inline-bold">Stage</span></h3>
                                    <h4>pts: {playData?.bracket_points || '-'}</h4>
                                </div>

                                <div id="pool-description" className={`description-container full-width${isBracketEditing ? ' is-dimmed' : ''}`}>
                                    <DescriptionDropdown summary={t('bracketStage.dropdownSummary')} onOpenChange={setBracketDropdownOpen}>
                                        <h4>{t('bracketStage.hint1')}</h4>
                                        <h4>{t('bracketStage.hint2')}</h4>
                                        <h4>{t('bracketStage.hint3')}</h4>
                                        <h4>{t('bracketStage.hint4')}</h4>
                                        <h4>{t('bracketStage.hint5')}</h4>
                                        <h4>{t('bracketStage.hint6')}</h4>
                                        <h4>{t('bracketStage.hint7')}</h4>
                                    </DescriptionDropdown>

                                    <div className="right-container">
                                        {/* Scenario 1 — not yet open */}
                                        {isBracketNotYet && (
                                            <>
                                                <p className="tournament-status-line"><span className="inline-neon-pink">{t('bracketStage.closedLabel')}</span> {t('bracketStage.forPredictions')}</p>
                                                <p className="tournament-status-line">
                                                    {t('bracketStage.opensIn')} <span className="inline-real-yellow">{bracketOpenCountdown}</span>
                                                </p>
                                            </>
                                        )}
                                        {/* Scenario 2 — open for predictions */}
                                        {isBracketOpen && (
                                            <>
                                                <p><span className="inline-neon-pink">{t('bracketStage.openLabel')}</span> {t('bracketStage.forPredictions')}</p>
                                                <p className="last-updated">
                                                    {t('bracketStage.closesIn')} <span className="inline-real-yellow">{bracketCloseCountdown}</span>
                                                </p>
                                            </>
                                        )}
                                        {/* Scenario 3 — bracket under way */}
                                        {isBracketClosed && (
                                            <p className="last-updated">
                                                {t('bracketStage.underwayPrefix')} <span className="inline-neon-pink inline-bold">{t('bracketStage.underwayHighlight')}</span>
                                                {' · '}<span className="inline-teal inline-bold">{playData.bracket_points} pts</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div id="bracket-predictions-content" className="prediction-display-content-wrapper">
                                <BracketStage
                                    data={playData.bracket_predictions}
                                    isOwner={isOwner}
                                    isEditable={isOwner && isBracketOpen}
                                    isSwappable={isOwner && isBracketClosed}
                                    isStageClosed={isBracketClosed}
                                    activeEditId={activeEditId}
                                    onEditingChange={handleEditingChange}
                                />
                                <div className={`last-updated${isBracketEditing ? ' is-dimmed' : ''}`}>
                                    <p className="last-updated">{t('lastUpdated')} {formatDate(playData.updated_at)}</p>
                                </div>
                            </div>

                        </section>
                    )}
                </div>
            )} {/* end play-stages-wrapper */}

            {/* ── IN POOLS TAB ── */}
            {isOwner && activeTab === 'inPools' && (
                <div className="plays-in-pools-wrapper play-pool-toggle-wrapper user-picks">
                    <div className="description-container full-width">
                            <div className="right-container">
                                <button className="btn btn-tan" onClick={() => setShowJoinPoolModal(true)}>
                                    Submit to Pool
                                </button>
                            </div>
                        </div>

                    <section className="user-picks-container">

                        <div className="prediction-display-intro">
                            <div className="title-container-wrapper">
                                <h3><span className="inline-teal inline-bold">play</span> {t('tabs.inPools')}</h3>
                            </div>

                        </div>

                        

                        <div className="user-stats-container">
                            <div className="table-container bg-black backdrop-gray">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="centered-text">{t('poolsTab.colPool')}</th>
                                            <th className="centered-text">{t('poolsTab.colOwner')}</th>
                                            <th className="centered-text">{t('poolsTab.colMembers')}</th>
                                            <th className="centered-text">{t('poolsTab.colPos')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {playPoolsLoading ? (
                                            <tr><td colSpan="4">{t('poolsTab.loading')}</td></tr>
                                        ) : playPools.length > 0 ? (
                                            playPools.map((pool, idx) => (
                                                <tr
                                                    key={pool.id ?? idx}
                                                    className="clickable-row"
                                                    onClick={() => pool.is_public
                                                        ? navigate(`/brackets/${tournament}`)
                                                        : navigate(`/brackets/${tournament}/pool/${pool.pool_name}`)
                                                    }
                                                >
                                                    <td className="table-link pool-link">{pool.pool_name}</td>
                                                    <td>{pool.manager}</td>
                                                    <td className="centered-text">-</td>
                                                    <td className="centered-text">{pool.rank || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4">{t('poolsTab.empty')}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </section>
                </div>
            )}

            <JoinPoolModal
                isOpen={showJoinPoolModal}
                tournamentId={playData?.tournament_id}
                plays={myPlays}
                onCancel={() => setShowJoinPoolModal(false)}
                onSuccess={() => {
                    setShowJoinPoolModal(false);
                    refreshPlayPools();
                    setActiveTab('inPools');
                }}
            />
            <ErrorDisplayModal
                isOpen={!!errorCode}
                code={errorCode}
                onClose={() => setErrorCode(null)}
            />
        </main>
    );
};

export default PlayPage;
