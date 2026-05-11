import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function AutominerInstructions({ gameStarted, isOpen, onClose }) {

    const { t } = useTranslation('autominer');
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
                className={`instructions-inner vindro-tan-border ${showText ? "visible" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <main className="main-instructions">
                    <div id="how-to-play-desc" className="instructions-modal-text">
                        <h2 id="how-to-play-title" className="yellow-title">{t('instructions.title')}</h2>
                        <h3>{t('instructions.subtitle')}</h3>

                        <ol className="ol-instruction-list">
                            <li><span className="strong white">{t('instructions.step1Bold')}</span> - {t('instructions.step1Text')}</li>
                            <li><span className="strong white">{t('instructions.step2Bold')}</span> - {t('instructions.step2Text')}</li>
                            <li><span className="strong white">{t('instructions.step3Bold')}</span> - {t('instructions.step3Text')}</li>
                            <li><span className="strong white">{t('instructions.step4Bold')}</span> - {t('instructions.step4Text')}</li>
                            <li><span className="strong white">{t('instructions.step5Bold')}</span> - {t('instructions.step5Text')}</li>
                        </ol>

                        <p className="stand-out-container yellow-strip">
                            <span className="strong white"><em>{t('instructions.tip1a')}</em></span> {t('instructions.tip1b')} <span className="strong white"><em>{t('instructions.tip1c')}</em></span> {t('instructions.tip1d')}
                        </p>

                        <div className="instruct-resources-container">
                            <div className="instruct-resource-inline">
                                <img src="/img/beam.webp" alt="" />
                                <p><span>Iron</span> {t('instructions.ironDesc')}</p>
                            </div>
                            <div className="instruct-resource-inline">
                                <img src="/img/sulfur.webp" alt="" />
                                <p><span>Sulfur</span> {t('instructions.sulfurDesc')}</p>
                            </div>
                            <div className="instruct-resource-inline">
                                <img src="/img/drill.webp" alt="" />
                                <p><span>Drills</span> {t('instructions.drillsDesc')}</p>
                            </div>
                            <div className="instruct-resource-inline">
                                <img src="/img/silver.webp" alt="" />
                                <p><span>Silver</span> {t('instructions.silverDesc')}</p>
                            </div>
                        </div>

                        <p className="stand-out-container yellow-strip">
                            <span className="strong white"><em>{t('instructions.tip2a')}</em></span> {t('instructions.tip2b')} <span className="strong white"><em>{t('instructions.tip2c')}</em></span> {t('instructions.tip2d')}
                        </p>
                    </div>

                    <button className="close-overlay-btn" onClick={onClose}>
                        Got it
                    </button>

                    <div className={`dev-footer ${gameStarted ? 'gameStarted' : 'no-game'}`}>
                        <span className="status-dot"></span>
                        <code>SYSTEM.STATUS: {gameStarted ? 'ACTIVE // MINING_IN_PROCESS' : 'NOT ACTIVE // MINING_EXPECTED'}</code>
                    </div>
                </main>
            </div>
        </div>
    );
}
