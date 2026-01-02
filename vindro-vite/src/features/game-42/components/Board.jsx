// src/game-42/components/Board.jsx
import React from "react";

export default function Board({ numsPlaced, placeNum, gameOver, endCause }) {
  return (
    <section id="game-42-buttons">
      {numsPlaced.map((val, idx) => (
        <button
          key={idx}
          className={`pos-42 
            ${val === 0 ? "open" : "closed"} 
            ${gameOver ? "game-over" : ""} 
            ${endCause === "42" ? "victory" : ""}`
          }
          onClick={() => placeNum(idx)}
          disabled={gameOver || val !== 0}
        >
          {val === 0 ? `${idx + 1}.` : val}
        </button>
      ))}
    </section>
  );
}
