// src/game-42/Game42.jsx
import React, { useState } from "react";
import Game42Helmet from "../../page-helmets/Game42Helmet";
import Board from "./components/Board";
import GameDisplay from "./components/GameDisplay";
import Instructions42 from "./components/Instructions42";
import useGame42Logic from "./hooks/useGame42Logic";
import WinModal from "./components/End42";
import NewBestModal from "../../components/ui/NewBestModal";

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
        prevTime,
        bestPoints,
        bestTime,
        elapsedSeconds,
        myGamescores,
        isNewBest,
        clearNewBest,
        startGame,
        placeNum,
        playAgain,
    } = useGame42Logic();

    return (
        <>
            <Game42Helmet />

            <main id="game-42">

                <div className="game-container">
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
                        prevTime={prevTime}
                        bestPoints={bestPoints}
                        bestTime={bestTime}
                        elapsedSeconds={elapsedSeconds}
                        myGamescores={myGamescores}
                        isNewBest={isNewBest}
                        startGame={startGame}
                        playAgain={playAgain}
                        isInstructionsOpen={isInstructionsOpen}
                        onOpenInstructions={() => setIsInstructionsOpen(true)}
                    />
                </div>
                {/* The Game Board */}


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

                <NewBestModal
                    isOpen={isNewBest && gameOver && endCause !== "42"}
                    score={points}
                    time={elapsedSeconds}
                    onClose={clearNewBest}
                />
            </main>
        </>
    );
}
