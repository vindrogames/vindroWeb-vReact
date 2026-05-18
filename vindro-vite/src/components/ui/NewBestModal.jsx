import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function NewBestModal({ isOpen, score, time, onClose, startNewGame }) {
    const { t } = useTranslation('common');
    const [showContent, setShowContent] = useState(false);
    const closeBtnRef = useRef(null);
    const previouslyFocusedElement = useRef(null);

    useEffect(() => {
        let timer;
        if (isOpen) {
            timer = setTimeout(() => setShowContent(true), 200);
        } else {
            setShowContent(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        previouslyFocusedElement.current = document.activeElement;
        closeBtnRef.current?.focus();

        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('keydown', handleEsc);
            previouslyFocusedElement.current?.focus();
        };
    }, [isOpen, onClose]);

    return (
        <div
            className={`new-best-overlay ${isOpen ? 'active' : 'inactive'}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={t('newBest.title')}
        >
            <div
                className={`new-best-panel ${showContent ? 'reveal' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="new-best-dev-header">
                    <span className="nb-status-dot"></span>
                    <code>SYSTEM.STATUS: NEW_RECORD // PERSONAL_BEST</code>
                </div>

                <div className="new-best-body">
                    <h2 className="new-best-title">{t('newBest.title')}</h2>

                    <div className="new-best-stats">
                        <div className="new-best-stat">
                            <code className="nb-stat-label">{t('newBest.score')}</code>
                            <span className="nb-stat-value">{score}</span>
                        </div>
                        <div className="new-best-stat-divider" aria-hidden="true" />
                        <div className="new-best-stat">
                            <code className="nb-stat-label">{t('newBest.time')}</code>
                            <span className="nb-stat-value">{time}s</span>
                        </div>
                    </div>
                </div>

                <div className="new-best-actions">
                    <button ref={closeBtnRef} className="nb-btn nb-btn-primary" onClick={onClose}>
                        {t('newBest.keepPlaying')}
                    </button>
                    {startNewGame && (
                        <button className="nb-btn nb-btn-secondary" onClick={startNewGame}>
                            {t('newBest.startNew')}
                        </button>
                    )}
                </div>

                <footer className="new-best-dev-footer">
                    <span className="nb-status-dot"></span>
                    <code>RECORD.SAVED // DB_SYNC_OK</code>
                </footer>
            </div>
        </div>
    );
}
