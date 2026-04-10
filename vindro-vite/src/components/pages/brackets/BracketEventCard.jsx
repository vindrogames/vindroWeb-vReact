import { useState, useEffect } from 'react';
import SmartLink from '../../ui/SmartLink';

function BracketEventCard({ eventTitle, phases = {}, startDate, route }) {
    const { groupPhases = [], bracketPhases = [] } = phases;
    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        let timeout;

        const startAnimation = () => {
            // Randomly choose a direction: 'roll-right' or 'roll-left'
            const direction = Math.random() > 0.5 ? 'roll-right' : 'roll-left';
            setAnimationClass(direction);

            // This duration (3000ms) should match the CSS animation duration
            timeout = setTimeout(() => {
                setAnimationClass(''); // Reset class to stop animation
                
                // Set a random delay between 2 and 6 seconds before next roll
                const nextDelay = Math.floor(Math.random() * 4000) + 2000;
                timeout = setTimeout(startAnimation, nextDelay);
            }, 3000); 
        };

        const initialDelay = Math.floor(Math.random() * 3000);
        timeout = setTimeout(startAnimation, initialDelay);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="bracket-event-card-container">
            
            <div className="bracket-event-card">
                {/* The Ball - Classes handled by React State */}
                <div className={`rolling-football ${animationClass}`}></div>

                <h4>{eventTitle}</h4>

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