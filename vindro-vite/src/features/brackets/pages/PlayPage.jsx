import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import playServices from '../services/playServices';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';
import formatDate from '../../../utils/dateFormatter';
import ErrorDisplayModal from '../../../components/ui/ErrorDisplayModal';
import PlayPageHelmet from '../../../page-helmets/PlayPageHelmet';
import WorldCupGroupStage from '../tournaments/world-cup-2026/stages/WorldCupGroupStage';
import WorldCupBracketStage from '../tournaments/world-cup-2026/stages/WorldCupBracketStage';

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

const startCountdown = (targetDateString, setTime) => {
    const target = new Date(targetDateString);

    function tick() {
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) {
            setTime("Closed");
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

    const { user } = useAuth();
    const { showLoader, hideLoader } = useLoading();
    const [playData, setPlayData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState('');
    const [bracketOpenCountdown, setBracketOpenCountdown] = useState('');
    const [bracketCloseCountdown, setBracketCloseCountdown] = useState('');
    const [errorCode, setErrorCode] = useState(null);

    // The "Master Switch": holds the ID of whatever is being edited
    const [activeEditId, setActiveEditId] = useState(null);

    // ── STAGE GATES ─────────────────────────────────────────────────────────────
    // Three scenarios per stage: not_ready | open | closed
    // A stage is "not_ready" when no close date has been set on the play data.
    // To manually force a scenario, comment out the derived lines and set directly:
    //   not_ready → const isGroupOpen = false; const isGroupClosed = false;
    //   open      → const isGroupOpen = true;  const isGroupClosed = false;
    //   closed    → const isGroupOpen = false; const isGroupClosed = true;
    const groupStageConfigured   = !!playData?.group_stage_close_date;
    const isGroupOpen            = groupStageConfigured && new Date() < new Date(playData.group_stage_close_date);
    const isGroupClosed          = groupStageConfigured && !isGroupOpen;

    // Bracket: 3 scenarios based on bracket_open_date and bracket_stage_close_date
    const bracketOpenDate   = playData?.bracket_open_date;
    const bracketCloseDate  = playData?.bracket_stage_close_date;
    const isBracketNotYet   = !!bracketOpenDate && new Date() < new Date(bracketOpenDate);
    const isBracketOpen     = !!bracketOpenDate && !isBracketNotYet && !!bracketCloseDate && new Date() < new Date(bracketCloseDate);
    const isBracketClosed   = !!bracketCloseDate && !isBracketNotYet && !isBracketOpen;

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

    // Group stage countdown — always running so the "Closed" signal fires automatically
    useEffect(() => {
        if (!playData?.group_stage_close_date) return;
        const interval = startCountdown(playData.group_stage_close_date, setCountdown);
        return () => clearInterval(interval);
    }, [playData?.group_stage_close_date]);

    // Bracket scenario 1 — countdown to bracket opening
    useEffect(() => {
        if (!isBracketNotYet || !bracketOpenDate) return;
        const interval = startCountdown(bracketOpenDate, setBracketOpenCountdown);
        return () => clearInterval(interval);
    }, [isBracketNotYet, bracketOpenDate]);

    // Bracket scenario 2 — countdown to bracket closing
    useEffect(() => {
        if (!isBracketOpen || !bracketCloseDate) return;
        const interval = startCountdown(bracketCloseDate, setBracketCloseCountdown);
        return () => clearInterval(interval);
    }, [isBracketOpen, bracketCloseDate]);

    const isOwner =
        playData &&
        user &&
        String(playData.user) === String(user.id);

    // isEditable = owner AND the relevant stage is still open
    const isGroupEditable = isOwner && isGroupOpen;

    const isBracketEditing = activeEditId?.startsWith('bk-');
    const isGroupEditing   = !!activeEditId && !isBracketEditing;

    const stages = STAGE_MAP[tournament] ?? {};
    const { GroupStage, BracketStage } = stages;

    if (loading) {
        return <div className="bracket-tournament-play page-loading">Loading...</div>;
    }

    if (!playData) {
        return (
            <main className="bracket-tournament-play">
                <div className="not-found-container">
                    <h2>play<span className="inline-teal inline-bold">NotFound</span></h2>
                    <div className="subtitle-container">
                        <p>This play doesn't exist or has been removed.</p>
                    </div>
                    <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>
                        Back to tournament
                    </button>
                </div>
            </main>
        );
    }

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
        <main id="play-page" className={`bracket-tournament-play-pool ${activeEditId ? 'has-active-focus' : ''}`}>

            <PlayPageHelmet playName={playData.name} tournamentName={playData.tournament_name || tournament} />

            <section className={`play-pool-intro hero-half bg-black${activeEditId ? ' is-dimmed' : ''}`}>
                <div className="play-pool-intro-wrapper">
                    <div className="text-container">
                        <h1 className="profile-intro">{playData.tournament_name || tournament}</h1>
                        <div className="play-specs">
                            {!isOwner ? (
                                <>
                                    <h2>
                                        <span className='inline-teal'>play </span>
                                        <span className="inline-bold">{playData.name}</span>
                                        {' '}<span className="inline-teal">by</span>{' '}
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
                                    <span className="inline-teal inline-bold">play</span>{' '}
                                    <span>{playData.name}</span>
                                </h2>
                            )}
                        </div>
                    </div>

                    <div className="go-back-button-container">
                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>Back</button>
                    </div>
                </div>
            </section>

            {/* ── GROUP STAGE ── */}
            <section id="groups-predictions" className={`play-prediction-container${isBracketEditing ? ' is-dimmed' : ''}`}>

                {GroupStage ? (
                    <div className="prediction-display-wrapper">
                        <div className={`stage-header${isGroupEditing ? ' is-dimmed' : ''}`}>
                            <h3>group<span className="inline-teal inline-bold">Stage</span></h3>
                            {/* Scenario 1 (not_ready): no status line */}
                            {isGroupOpen && (
                                <p className="last-updated">
                                    Closes in <span className="tournament-countdown">{countdown}</span>
                                </p>
                            )}
                            {isGroupClosed && (
                                <p className="last-updated">
                                    <span className="tournament-countdown">Stage closed</span>
                                    {' · '}<span className="inline-teal inline-bold">{playData.group_points} pts</span>
                                </p>
                            )}
                        </div>

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
                            <p className="last-updated">Updated: {formatDate(playData.updated_at)}</p>
                        </div>

                    </div>
                ) : (
                    <></>
                )}


            </section>

            {/* ── BRACKET STAGE ── */}
            <section className={`play-prediction-container${activeEditId && !isBracketEditing ? ' is-dimmed' : ''}`}>


                {BracketStage ? (

                    <div id="brackets-predictions" className="prediction-display-wrapper">

                        <div className={`stage-header${isBracketEditing ? ' is-dimmed' : ''}`}>
                            <h3>bracket<span className="inline-teal inline-bold">Stage</span></h3>
                            {/* Scenario 1 — not yet open */}
                            {isBracketNotYet && (
                                <p className="last-updated">
                                    Opens in <span className="tournament-countdown">{bracketOpenCountdown}</span>
                                </p>
                            )}
                            {/* Scenario 2 — open for predictions */}
                            {isBracketOpen && (
                                <p className="last-updated">
                                    Closes in <span className="tournament-countdown">{bracketCloseCountdown}</span>
                                </p>
                            )}
                            {/* Scenario 3 — bracket under way */}
                            {isBracketClosed && (
                                <p className="last-updated">
                                    Under <span className="inline-neon-pink inline-bold">Way!</span>
                                    {' · '}<span className="inline-teal inline-bold">{playData.bracket_points} pts</span>
                                </p>
                            )}
                        </div>
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
                            <p className="last-updated">Updated: {formatDate(playData.updated_at)}</p>
                        </div>
                    </div>
                ) : (
                    <></>
                )}

            </section>

            <ErrorDisplayModal
                isOpen={!!errorCode}
                code={errorCode}
                onClose={() => setErrorCode(null)}
            />
        </main>
    );
};

export default PlayPage;
