import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import playServices from '../services/playServices';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';
import GroupStagePredictions from './PlayGroupStagePredicts';
import BracketStagePredictions from './PlayBracketStagePredicts';
import formatDate from '../../../utils/dateFormatter';

const PlayPage = () => {

    const { tournament } = useParams();
    const navigate = useNavigate();

    const location = useLocation();
    const { user } = useAuth();
    const { showLoader, hideLoader } = useLoading();
    const [playData, setPlayData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Grab ID strictly from state passed during navigation
    const playId = location.state?.playId;

    // PlayPage.jsx (The useEffect snippet)
    useEffect(() => {

        const fetchPlay = async () => {
            if (!playId) return;
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
                console.error("Fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlay();
    }, [playId]);

    const isOwner =
        playData &&
        user &&
        String(playData.user) === String(user.id);

    if (loading) {
        return <div className="bracket-tournament-play p-20 text-center">Loading...</div>;
    }

    if (!playData) {
        return (
            <div className="bracket-tournament-play p-20 text-center">
                <h2>No Play Found</h2>
                <p className="text-gray-500">The bracket ID might be invalid or has been moved.</p>
            </div>
        );
    }

    const avatarUrl = playData?.user_avatar || '';
    // List of base colors to check for in the URL
    console.log(playData.user.avatar);

    const colorMap = {
        pink: '#ff2edcff',
        green: '#b4ff00ff',
        orange: '#D97706',
        purple: '#a020f0',
        teal: '#66FCF1',
        green: '#45A29E',
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
        } finally {
            hideLoader();
        }
    };

    return (
        <main className="bracket-tournament-play">

            <div className="bracket-tournament-play-container">

                <section className="header-container">
                    <div className="text-container">
                        <h1 className="profile-intro">{playData.tournament_name}</h1>
                        <div className="play-specs">
                            {!isOwner ?
                                (<><h2><span className="inline-bold">{playData.name}</span> <span className="inline-teal">by</span> <span className="inline-bold">{playData.user_name}</span></h2> <button className="avatar-link-btn" style={{ borderBottom: `2px solid ${borderColor}` }} onClick={() => navigate(`/user/${playData.user}`)}><img src={playData.user_avatar} alt={playData.user_name} /></button></>) :
                                (<h2>play: <span className="inline-bold">{playData.name}</span></h2>)}
                        </div>
                    </div>
                    <div className="go-back-button-container">
                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>Back</button>
                    </div>

                </section>

                <section className="groups-stage">

                    <div className="stage-header">
                        <h3>group<span className="inline-teal inline-bold">Stage</span></h3>
                        <p className="last-updated">tba...</p>
                    </div>

                    {/* Pass isOwner down so sub-components can toggle editability */}
                    <GroupStagePredictions
                        data={playData.group_predictions}
                        isOwner={isOwner}
                        onUpdate={handleUpdateGroupOrder}
                        onSave={handleSaveGroup}
                    />

                    <div className="last-updated">
                        <p className="last-updated">Updated: {formatDate(playData.updated_at)}</p>
                    </div>

                </section>

                <BracketStagePredictions
                    data={playData.bracket_predictions}
                    isOwner={isOwner}
                />
            </div>
        </main>
    );
};

export default PlayPage;