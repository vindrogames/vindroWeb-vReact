import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import playService from '../services/playService';
import { useAuth } from '../../../contexts/auth/AuthContext';
import GroupStagePredictions from './GroupStagePredictions';
import BracketStagePredictions from './BracketStagePredictions';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';
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
                const result = await playService.getPlayById(playId);

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

    /**
     * UI Protection Logic
     * We cast to String to ensure "1" === 1 doesn't fail.
     * Checks if the currently logged-in user matches the owner of the play.
     */
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

    return (
        <main className="bracket-tournament-play">

            <div className="bracket-tournament-play-container">

                <section className="header-container">
                    <div className="top-container">
                        <h1 className="profile-intro">{playData.tournament_name}</h1>
                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>Back</button>
                    </div>

                    <div className="play-specs">
                        <h2><span className="inline-bold">{playData.name}</span> <span className="inline-teal">by</span> <span className="inline-bold">{playData.user_name}</span></h2>
                        <img src={playData.user_avatar} alt="" />
                    </div>
                </section>

                <section className="groups-stage">
                    <h3>group<span className="inline-teal inline-bold">Stage</span></h3>
                    <p className="last-updated">Updated: {formatDate(playData.updated_at)}</p>
                    <div className="table-container">
                        <table className="predictions-table">
                            <thead>
                                <tr>
                                    <th className="col-group">Group</th>
                                    <th className="col-rank">1st</th>
                                    <th className="col-rank">2nd</th>
                                    <th className="col-rank">3rd</th>
                                    <th className="col-rank">4th</th>
                                </tr>
                            </thead>
                            <tbody>
                                {playData.group_predictions &&
                                    Object.entries(playData.group_predictions)
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([groupName, teams]) => (
                                            <tr key={groupName} className="group-row">
                                                <td className="group-label">{groupName}</td>
                                                {teams.map((teamObj, index) => (
                                                    <td key={index} className={`team-cell rank-${index + 1}`}>
                                                        <div className="team-info">
                                                            {/* Using flag-icons CSS classes */}
                                                            <span className={`fi fi-${teamObj.flag} team-flag`}></span>
                                                            <span className="team-name">{teamObj.team}</span>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                }
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="brackets-stage">

                </section>
            </div>


            <header className="">
                <h1 className="">{playData.name}</h1>

                {/* Paint Save button only for the authenticated owner */}
                {isOwner && (
                    <button
                        className="btn-save bg-teal-600 text-white px-4 py-2 rounded"
                        onClick={() => {/* add your save function here */ }}
                    >
                        Save Predictions
                    </button>
                )}
            </header>

            {/* Pass isOwner down so sub-components can toggle editability */}
            <GroupStagePredictions
                data={playData.group_predictions}
                isOwner={isOwner}
            />

            <BracketStagePredictions
                data={playData.bracket_predictions}
                isOwner={isOwner}
            />
        </main>
    );
};

export default PlayPage;