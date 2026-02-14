import SmartLink from '../../ui/SmartLink';

function BracketEventCard({ eventTitle, phases = {}, startDate, route }) {
    const { groupPhases = [], bracketPhases = [] } = phases;

    return (
        <div className="bracket-event-card-container">

            <div className="bracket-event-card">

                <h4>{eventTitle}</h4>

                {/* Group Stage - Only renders if there are group phases */}
                {groupPhases.length > 0 && (
                    <div className="phase-section">
                        <h5 className="phase-label">Groups Stage</h5>
                        <ul className="event-stages">
                            {groupPhases.map((phase, i) => (
                                <li key={`group-${i}`}>{phase}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Bracket Stage */}
                <div className="phase-section">
                    <h5 className="phase-label">Consolidated Bracket</h5>
                    <ul className="event-stages">
                        {bracketPhases.map((phase, i) => (
                            <li key={`bracket-${i}`}>{phase}</li>
                        ))}
                    </ul>
                </div>

                <div className="start-join">
                    <h5>{startDate}</h5>
                    <SmartLink to={route} className='bracket-event-join-btn'>
                        Join
                    </SmartLink>
                </div>
            </div>
        </div>
    );
}

export default BracketEventCard;