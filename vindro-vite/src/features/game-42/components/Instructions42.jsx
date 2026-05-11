import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function Instructions42({ isOpen, onClose }) {
    const { t } = useTranslation('game-42');
    const [showText, setShowText] = useState(false);
    const dialogRef = useRef(null);
    const closeBtnRef = useRef(null);
    const previouslyFocusedElement = useRef(null);

    useEffect(() => {
        let timer;
        if (isOpen) {
            timer = setTimeout(() => setShowText(true), 200);
        } else {
            setShowText(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        previouslyFocusedElement.current = document.activeElement;
        closeBtnRef.current?.focus();

        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("keydown", handleEsc);
            previouslyFocusedElement.current?.focus();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const rules = t('instructions.rules', { returnObjects: true });

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
                        <h2 id="how-to-play-title" className="yellow-title">{t('instructions.title')}</h2>
                        <h3>
                            {t('instructions.placeNumbersPre')}{" "}
                            <span className="strong white">14 random numbers</span>{" "}
                            <span className="strong yellow">(1–42)</span>{" "}
                            {t('instructions.placeNumbersMid')}
                        </h3>

                        <ul className="ul-instruction-list">
                            {rules.map((rule, i) => (
                                <li key={i}>{rule}</li>
                            ))}
                        </ul>

                        <p className="stand-out-container yellow-strip">
                            {t('instructions.gameOver')}{" "}
                            <strong className="you-lose">
                                <em>GAME OVER</em>
                            </strong>
                        </p>

                        <p className="italics-note">
                            <span className="white">{t('instructions.secret')}</span>
                        </p>
                    </div>

                    <button
                        ref={closeBtnRef}
                        className="close-overlay-btn"
                        onClick={onClose}
                    >
                        {t('instructions.close')}
                    </button>

                    <footer className="dev-footer">
                        <span className="status-dot" aria-hidden="true"></span>
                        <code>SYSTEM.STATUS: ACTIVE // 42_EXPECTED</code>
                    </footer>
                </main>

                <aside className="refs">
                    <p>
                        {t('instructions.videoLabel')}{" "}
                        <a href="https://youtu.be/ZwyAUVebZM0" target="_blank" rel="noopener noreferrer">
                            {t('instructions.videoLinkText')}
                        </a>
                    </p>
                    <p>
                        {t('instructions.inspiredBy')}{" "}
                        <a href="https://boardgamegeek.com/boardgame/244992/mind" target="_blank" rel="noopener noreferrer">
                            The Mind
                        </a>
                    </p>
                </aside>
            </div>
        </div>
    );
}
