// src/game-42/components/GameDisplay.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from '../../../contexts/auth/AuthContext';
import PointsTable from "./PointsTable";

export default function GameDisplay({
    gameStarted, numToPlace, points, startGame, playAgain,
    gameOver, endCause, prevPoints, prevTime,
    bestPoints, bestTime,
    elapsedSeconds,
    onOpenInstructions, isInstructionsOpen
}) {
    const { t } = useTranslation('game-42');
    const { user } = useAuth();
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 678);

    
    const game42Cols = [
        {
            header: t('table.gameScoresHeader'),
            currentRow: t('table.currentRowHeader'),
            prevRow: t('table.prevRowHeader'),
            bestRow: t('table.bestRowHeader')
        },
        {
            header: t('table.gamePointsHeader'),
            currentRow: points,
            prevRow: prevPoints !== null ? prevPoints : '-',
            bestRow: bestPoints !== null ? bestPoints : '-',
        },
        {
            header: t('table.gameTimeHeader'),
            currentRow: gameStarted ? `${elapsedSeconds}s` : '-',
            prevRow: prevTime !== null ? `${prevTime}s` : '-',
            bestRow: bestTime !== null ? `${bestTime}s` : '-',
        }
    ];

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
        if (endCause === "42") return t('game.perfectScore');
        if (endCause === "bad-placement") return t('game.badOrder');
        if (endCause === "no-possible-moves") return (
            <>{t('game.cantPlace')} <span className="error-num">{numToPlace}</span></>
        );
        return "-";
    };

    return (
        <section id="display-42">
            <div className="instructions-42">
                <h1 className="title-42">
                    <span className="inline-teal inline-bold">42</span> {t('title')}
                </h1>
                <button type="button" className="how-to-play-toggle btn btn-tan" onClick={onOpenInstructions}>
                    <span className="toggle-label">{t('howToPlay')}</span>
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
                            {gameOver ? t('playAgain') : t('start')}
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

                <div className="table-wrapper">
                    <PointsTable columns={game42Cols} tableType="brackets-table" emptyMessage={t('brackets.empty')} />
                </div>

                <div className={`score-save-indicator ${user ? 'is-saving' : 'not-saving'}`}>
                    <span className="save-indicator-dot" aria-hidden="true"></span>
                    <code>{user ? t('scoreIndicator.saving') : t('scoreIndicator.notSaving')}</code>
                </div>
            </div>
        </section>
    );
}
