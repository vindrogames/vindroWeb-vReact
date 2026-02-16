// src/game-42/Game42.jsx
import React, { useState } from "react";
import Game42Helmet from "../../page-helmets/Game42Helmet";
import Board from "./components/Board";
import GameDisplay from "./components/GameDisplay";
import Instructions42 from "./components/Instructions42";
import useGame42Logic from "./hooks/useGame42Logic";
import WinModal from "./components/End42";

export default function Game42() {
    // 1. Manage the visibility state here at the top level
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

    const {
        numsPlaced,
        numToPlace,
        points,
        gameOver,
        endCause,
        gameStarted,
        prevPoints,
        todayBest,
        startGame,
        placeNum,
        playAgain,
    } = useGame42Logic();

    return (
        <>
            <Game42Helmet />
            <main id="game-42">
                {/* The Game Board */}
                <Board
                    numsPlaced={numsPlaced}
                    placeNum={placeNum}
                    gameOver={gameOver}
                    endCause={endCause}
                />

                {/* The Control Panel/Display */}
                <GameDisplay
                    gameStarted={gameStarted}
                    numToPlace={numToPlace}
                    points={points}
                    gameOver={gameOver}
                    endCause={endCause}
                    prevPoints={prevPoints}
                    todayBest={todayBest}
                    startGame={startGame}
                    playAgain={playAgain}
                    // Pass the state and the toggle function
                    isInstructionsOpen={isInstructionsOpen}
                    onOpenInstructions={() => setIsInstructionsOpen(true)}
                />

                {/* The Full-Screen Instructions Modal */}
                <Instructions42
                    isOpen={isInstructionsOpen}
                    onClose={() => setIsInstructionsOpen(false)}
                />

                {/* End42 could be added here following the same pattern */}
                {/* ... inside your return ... */}
                <WinModal
                    isOpen={endCause === "42"}
                    onDone={playAgain}
                />
            </main>
        </>
    );
}
