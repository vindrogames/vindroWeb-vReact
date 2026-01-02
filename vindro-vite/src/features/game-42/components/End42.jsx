import React, { useState, useEffect } from 'react';

export default function WinModal({ isOpen, onDone }) {
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        let timer;
        if (isOpen) {
            timer = setTimeout(() => setShowText(true), 300);
        } else {
            setShowText(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    return (
        <div className={`win-modal-overlay ${isOpen ? "active" : "inactive"}`}>
            <div className={`win-modal-content ${showText ? "reveal" : ""}`}>
                <div className="victory-branding">
                    <h3 className="big-42">42</h3>
                </div>

                <div className="victory-details">
                    <div className="win-dev-footer">
                        <span className="win-status-dot"></span>
                        <code>SYSTEM.STATUS: SUCCESS // 42_MATCH</code>
                    </div>
                </div>

                <button className="reinitialize-btn" onClick={onDone}>
                    Play Again
                </button>
            </div>
        </div>
    );
}