// src/game-42/components/Instructions42.jsx
import React, { useState, useEffect } from "react";

export default function Instructions42({ isOpen, onClose }) {
    
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        let timer;
        if (isOpen) {
            // Delay the text fade-in slightly to let the hologram expand first
            timer = setTimeout(() => setShowText(true), 200);
        } else {
            setShowText(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    return (
        <div
            className={`how-to-play-content ${isOpen ? "open" : "closed"}`}
            onClick={onClose}
        >
            <div
                className={`instructions-inner ${showText ? "visible" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="main-instructions">
                    <div className="instructions-modal-text">
                        <h2>How to Play</h2>
                        <h3>Try to place <strong>14 random numbers</strong> <span className="range">(1-42)</span> in ascending order.</h3>

                        <ul className="instruction-list">
                            <li>The numbers are drawn one by one.</li>
                            <li>You can place a number in any open position.</li>
                            <li>Once placed, numbers cannot be moved.</li>
                            <li>Position 1 is for the lowest, 14 for the highest.</li>
                            <li>
                                Each correctly placed number <span className="operator">+= 3</span> points.
                            </li>
                        </ul>

                        <p className="logic-warning">If a number breaks the ascending order, or no valid slots remain: <strong className="you-lose"><em>GAME OVER</em></strong></p>

                        <p className="hitchhiker-note">
                            Place all 14 numbers and you may discover the meaning of life, the universe, and everything.
                        </p>
                    </div>

                    <button className="close-overlay-btn" onClick={onClose}>
                        Got it
                    </button>

                    <div className="dev-footer">
                        <span className="status-dot"></span>
                        <code>SYSTEM.STATUS: ACTIVE // 42_EXPECTED</code>
                    </div>
                </div>

                <div className="refs">
                    <p>Video <a href="https://youtu.be/ZwyAUVebZM0" target="_blank" rel="noopener noreferrer">How to play</a></p>
                    <p>Inspired by <a href="https://boardgamegeek.com/boardgame/244992/mind" target="_blank" rel="noopener noreferrer">The Mind</a></p>
                </div>
            </div>
        </div>
    );
}