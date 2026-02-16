import React, { useState, useEffect, useRef } from "react";

export default function Instructions42({ isOpen, onClose }) {
    const [showText, setShowText] = useState(false);
    const dialogRef = useRef(null);
    const closeBtnRef = useRef(null);
    const previouslyFocusedElement = useRef(null);

    // Fade animation logic
    useEffect(() => {
        let timer;
        if (isOpen) {
            timer = setTimeout(() => setShowText(true), 200);
        } else {
            setShowText(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    // Accessibility + focus management
    useEffect(() => {
        if (!isOpen) return;

        previouslyFocusedElement.current = document.activeElement;

        closeBtnRef.current?.focus();

        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("keydown", handleEsc);
            previouslyFocusedElement.current?.focus();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="how-to-play-content open"
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-to-play-title"
            aria-describedby="how-to-play-desc"
            ref={dialogRef}
            onClick={onClose}
        >
            <div
                className={`instructions-inner vindro-teal-border ${showText ? "visible" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <main className="main-instructions">
                    <div id="how-to-play-desc" className="instructions-modal-text">
                        <h2 id="how-to-play-title" className="yellow-title">How to Play</h2>
                        <h3>
                            Try to place <span className="strong white">14 random numbers</span>{" "}
                            <span className="strong yellow">(1–42)</span> in ascending order.
                        </h3>

                        <ul className="ul-instruction-list">
                            <li>The numbers are drawn one by one.</li>
                            <li>You can place a number in any open position.</li>
                            <li>Once placed, numbers cannot be moved.</li>
                            <li>Position 1 is for the lowest, 14 for the highest.</li>
                            <li>
                                Each correctly placed number{" "}
                                <span className="operator">+= 3</span> points.
                            </li>
                        </ul>

                        <p className="stand-out-container yellow-strip">
                            If a number breaks the ascending order, or no valid
                            slots remain:{" "}
                            <strong className="you-lose">
                                <em>GAME OVER</em>
                            </strong>
                        </p>

                        <p className="italics-note">
                            <span className="white">Place all 14 numbers and you may discover the meaning
                            of life, the universe, and everything.</span>
                        </p>
                    </div>

                    <button
                        ref={closeBtnRef}
                        className="close-overlay-btn"
                        onClick={onClose}
                    >
                        Got it
                    </button>

                    <footer className="dev-footer">
                        <span
                            className="status-dot"
                            aria-hidden="true"
                        ></span>
                        <code>SYSTEM.STATUS: ACTIVE // 42_EXPECTED</code>
                    </footer>
                </main>

                <aside className="refs">
                    <p>
                        Video{" "}
                        <a
                            href="https://youtu.be/ZwyAUVebZM0"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            How to play
                        </a>
                    </p>
                    <p>
                        Inspired by{" "}
                        <a
                            href="https://boardgamegeek.com/boardgame/244992/mind"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            The Mind
                        </a>
                    </p>
                </aside>
            </div>
        </div>
    );
}
