import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import playServices from '../services/playServices';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';
import GroupStagePredictions from '../components/PlayGroupStagePredicts';
import BracketStagePredictions from '../components/PlayBracketStagePredicts';
import formatDate from '../../../utils/dateFormatter';
import ErrorDisplayModal from '../../../components/ui/ErrorDisplayModal';

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

    const { tournament } = useParams();
    const navigate = useNavigate();

    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { showLoader, hideLoader } = useLoading();
    const [playData, setPlayData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState('');
    const [errorCode, setErrorCode] = useState(null);

    const playId = location.state?.playId || searchParams.get('pid');

    // PlayPage.jsx (The useEffect snippet)
    useEffect(() => {

        const fetchPlay = async () => {
            if (!playId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const result = await playServices.getPlayById(playId);

                // If backend follows the { success, data } pattern:
                if (result && result.success) {
                    setPlayData(result.data);
                } else {
                    // Fallback if your backend sends the play directly
                    setPlayData(result);
                }
            } catch (error) {
                setErrorCode(toErrorCode(error));
            } finally {
                setLoading(false);
            }
        };
        fetchPlay();
    }, [playId]);

    useEffect(() => {
        if (!playData?.group_stage_close_date) return;
        const interval = startCountdown(playData.group_stage_close_date, setCountdown);
        return () => clearInterval(interval);
    }, [playData?.group_stage_close_date]);

    const isOwner =
        playData &&
        user &&
        String(playData.user) === String(user.id);

    if (loading) {
        return <div className="bracket-tournament-play page-loading">Loading...</div>;
    }

    if (!playId) {
        return (
            <main className="bracket-tournament-play">
                <div className="not-found-container">
                    <h2>direct<span className="inline-teal inline-bold">Link</span></h2>
                    <div className="subtitle-container">
                        <p>Direct links to plays aren't supported.</p>
                        <p>Navigate to this play from the tournament page.</p>
                    </div>
                    <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>
                        Go to tournament
                    </button>
                </div>
            </main>
        );
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

    // find first match in URL
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
            const result = await playServices.updateGroupPredictions(playId, playData.group_predictions);
            if (result?.success) {
                setPlayData(prev => ({ ...prev, updated_at: result.data.updated_at }));
            }
        } catch (err) {
            setErrorCode(toErrorCode(err));
        } finally {
            hideLoader();
        }
    };

    return (
        <main id="play-page" className="bracket-tournament-play-pool">

            <section className="play-pool-intro hero-half bg-black">
                <div className="play-pool-intro-wrapper">
                    <div className="text-container">
                        <h1 className="profile-intro">{playData.tournament_name || tournament}</h1>
                        <div className="play-specs">
                            {!isOwner ?
                                (<><h2><span className="inline-bold">{playData.name}</span> <span className="inline-teal">by</span> <span className="inline-bold">{playData.user_name}</span></h2> <button className="avatar-link-btn" style={{ borderBottom: `2px solid ${borderColor}` }} onClick={() => navigate(`/user/${playData.user}`)}><img src={playData.user_avatar} alt={playData.user_name} /></button></>) :
                                (<h2><span className="inline-teal inline-bold">play</span> <span >{playData.name}</span></h2>)}
                        </div>
                    </div>

                    <div className="go-back-button-container">
                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>Back</button>
                    </div>
                </div>
            </section>

            <section id="groups-predictions" className="play-prediction-container">

                <div className="prediction-display-wrapper">

                    <div className="stage-header">
                        <h3>group<span className="inline-teal inline-bold">Stage</span></h3>
                        <p className="last-updated">Starts in <span className="inline-neon-pink inline-bold">{countdown}</span></p>
                    </div>

                    {/* Pass isOwner down so sub-components can toggle editability */}
                    <GroupStagePredictions
                        data={playData.group_predictions}
                        isOwner={isOwner}
                        onUpdate={handleUpdateGroupOrder}
                        onSave={handleSaveGroup}
                    />

                    <div className="last-updated">
                        <p className="last-updated"><span className="inline-teal inline-bold">Updated:</span> {formatDate(playData.updated_at)}</p>
                    </div>

                </div>


            </section>

            <section id="groups-predictions" className="play-prediction-container">
                <div className="prediction-display-wrapper">
                    <div className="stage-header">
                        <h3>bracket<span className="inline-teal inline-bold">Stage</span></h3>
                        <p className="last-updated">Starts in <span className="inline-neon-pink inline-bold">{countdown}</span></p>
                    </div>
                </div>

                <BracketStagePredictions
                    data={playData.bracket_predictions}
                    isOwner={isOwner}
                />

                <div className="last-updated">
                    <p className="last-updated"><span className="inline-teal inline-bold">Updated:</span> {formatDate(playData.updated_at)}</p>
                </div>

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