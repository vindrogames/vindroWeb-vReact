// src/game-42/components/GameDisplay.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from '../../../contexts/AuthContext';

export default function GameDisplay({
    gameStarted, numToPlace, points, startGame, playAgain,
    gameOver, endCause, prevPoints, todayBest,
    onOpenInstructions, isInstructionsOpen
}) {
    const { isAuthenticated } = useAuth();
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 678);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 678);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleAction = (actionFn) => {
        if (isInstructionsOpen) onOpenInstructions(false);
        actionFn();
    };

    const renderEndText = () => {
        if (endCause === "42") return "🎉 42! Perfect Score!";
        if (endCause === "bad-placement") return "Fatal: Bad Order";
        if (endCause === "no-possible-moves") return (
            <>Err: Can't place <span className="error-num">{numToPlace}</span></>
        );
        return "-";
    };

    return (
        <section id="display-42">
            <div className="instructions-42">
                <h1 className="title-42">
                    <span className="inline-teal inline-bold">42</span> the game
                </h1>
                <button type="button" className="how-to-play-toggle" onClick={onOpenInstructions}>
                    <span className="toggle-label">How to Play</span>
                </button>
            </div>

            <div className="showcase-42">
                <div className="game-42-play-container">
                    {!gameStarted || (gameOver && endCause !== "42") ? (
                        <button
                            id="game-42-play-button"
                            onClick={() => handleAction(gameOver ? playAgain : startGame)}
                            className={`btn ${gameOver ? "game-over" : ""}`}
                        >
                            {gameOver ? "Play again" : "Start"}
                        </button>
                    ) : (
                        <div className="game-42-number-display">
                            <div id="number-to-place" className={`displayed ${gameOver && endCause !== "42" ? "game-over" : ""}`}>
                                {numToPlace ?? "-"}
                            </div>
                        </div>
                    )}
                    <div className={`end-game-message ${gameOver ? "visible" : "hidden"}`}>
                        <span className="status-dot"></span>
                        <code>{renderEndText()}</code>
                    </div>
                </div>

                <div className="game-42-results-grid">
                    <div id="game-points"><p>This Game</p><p>{points}</p></div>
                    <div id="prev-points"><p>Prev Game</p><p>{prevPoints ?? "-"}</p></div>
                    <div id="best"><p>Best Game</p><p>{todayBest ?? "-"}</p></div>
                </div>
            </div>
        </section>
    );
}
