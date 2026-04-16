import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import playServices from '../services/playServices';
import { useAuth } from '../../../contexts/auth/AuthContext';
import GroupStagePredictions from './PlayGroupStagePredicts';
import BracketStagePredictions from './PlayBracketStagePredicts';
import formatDate from '../../../utils/dateFormatter';

const PlayPage = () => {

    const { tournament } = useParams();
    const navigate = useNavigate();

    const location = useLocation();
    const { user } = useAuth();
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

    const handleUpdateGroupOrder = (groupName, newOrder) => {
        setPlayData(prevData => {
            if (!prevData) return prevData;

            return {
                ...prevData,
                group_predictions: {
                    ...prevData.group_predictions,
                    [groupName]: newOrder // Replace only the specific group's array
                }
            };
        });
    };

    return (
        <main className="bracket-tournament-play">

            <div className="bracket-tournament-play-container">

                <section className="header-container">
                    <div className="text-container">
                        <h1 className="profile-intro">{playData.tournament_name}</h1>
                        <div className="play-specs">
                            {!isOwner ? 
                                (<><h2><span className="inline-bold">{playData.name}</span> <span className="inline-teal">by</span> <span className="inline-bold">{playData.user_name}</span></h2> <img src={playData.user_avatar} alt=""></img></>) : 
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