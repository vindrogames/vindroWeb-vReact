import React, { useState, useEffect } from "react";
import HowToPlayDropdown from "../../../components/ui/HowToPlayDropdown";
import { useAuth } from '../../../contexts/AuthContext';

export default function GameDisplay({
    gameStarted,
    numToPlace,
    points,
    startGame,
    playAgain,
    gameOver,
    endCause,
    prevPoints,
    todayBest,
}) {
    const { isAuthenticated } = useAuth();

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // --- Responsive Logic ---
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 678);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 678);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleAction = (actionFn) => {
        setDropdownOpen(false); // Snap shut on game interaction
        actionFn();
    };

    const renderEndText = () => {
        if (endCause === "42") return "Congratulations! You reached 42 points!";
        if (endCause === "bad-placement") {
            return <>🫤 Wrong order</>;
        }
        if (endCause === "no-possible-moves") {
            return <>😖 Can't place number <span className="inline-real-red inline-bold">{numToPlace}</span></>;
        }
        return "";
    };

    return (
        <section id="display-42">
            <div className="instructions-42">
                <h1 className="title-42">
                    <span className="inline-teal inline-bold">42</span> the game
                </h1>
                <HowToPlayDropdown
                    isOpen={dropdownOpen}
                    onToggle={setDropdownOpen}
                    id="howtoplay-42"
                    text={
                        <>
                            <p>Inspired by <a id="the-mind-link" className="" href="https://boardgamegeek.com/boardgame/244992/mind" target="_blank" rel="noopener noreferrer">The Mind</a> card game, you must place 14 random numbers (1-42), in <strong><em>ascending order</em></strong> in the list on the left</p>
                            <p><strong className="inline-bold inline-real-red">·</strong> Numbers are displayed one at a time</p>
                            <p><strong className="inline-bold inline-real-red">·</strong> Decide where to place each individual number so future numbers can be placed in order</p>
                            <p><strong className="inline-bold inline-real-red">·</strong> You can place any number in any open position on the list</p>
                            <p><strong className="inline-bold inline-real-red">·</strong> Position 1 is for what will be the <strong><em>lowest number</em></strong></p>
                            <p><strong className="inline-bold inline-real-red">·</strong> Position 14 is for what will be the <strong><em>highest number</em></strong></p>
                            <p>If you place a number that breaks the ascending order, or if you can't correctly place a number, <strong>you lose</strong>.</p>
                            <p>For each correctly placed number, you get 3 points. If you correctly place all 14 randomm numbers, you get <strong>42 points</strong> and win the game</p>
                            <p><a id="how-to-play-link" className="inline-yellow nav" href="https://youtu.be/ZwyAUVebZM0" target="_blank" rel="noopener noreferrer">See how to play</a></p>
                        </>
                    }
                />
            </div>

            <div className="showcase-42">
                <div className="game-42-play-container">
                    {!gameStarted || gameOver ? (
                        <button
                            id="game-42-play-button"
                            onClick={() => handleAction(gameOver ? playAgain : startGame)}
                            className={`btn ${gameOver ? "game-over" : ""}`}
                        >
                            {gameOver ? "Play again" : "Start"}
                        </button>
                    ) : (
                        <div className="game-42-number-display">
                            <div id="number-to-place" className={`displayed ${gameOver ? "game-over" : ""}`}>
                                {numToPlace ?? "-"}
                            </div>
                        </div>
                    )}
                    <p className={`end-game-message ${!gameOver ? "hidden" : "visible"}`}>
                        {renderEndText()}
                    </p>
                </div>

                <div className="game-42-results-grid">
                    <div id="game-points">
                        <p>{isSmallScreen ? "This Game:" : "This Game"}</p>
                        <p>{points}</p>
                    </div>
                    <div id="prev-points">
                        <p>{isSmallScreen ? "Prev Game:" : "Prev Game"}</p>
                        <p>{prevPoints ?? "-"}</p>
                    </div>
                    <div id="best">
                        <p>
                            {isSmallScreen ? "Best Game:" : "Best Game"}
                        </p>
                        <p>{todayBest ?? "-"}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
