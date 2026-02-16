import React, { useState, useEffect, useRef } from "react";

export default function AutominerInstructions({ gameStarted, isOpen, onClose }) {

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
                        <h2 id="how-to-play-title" className="yellow-title">How to Play</h2>
                        <h3>Build an automated mining empire to maximize <span className="strong white">Silver</span> production!</h3>

                        <ol className="ol-instruction-list">
                            <li><span className="strong white">Click to Mine Iron</span> - Start by manually clicking the iron mining button</li>
                            <li><span className="strong white">Buy Iron Miners</span> - Automate iron production (cost increases every 10 miners)</li>
                            <li><span className="strong white">Gather Resources</span> - Use iron to buy sulfur and drills</li>
                            <li><span className="strong white">Mine Silver</span> - 1 Silver requires 10 sulfur + 1 drill</li>
                            <li><span className="strong white">Scale Up</span> - Automate Silver production to max out! (cost increases every 10 miners)</li>
                        </ol>

                        <p className="stand-out-container yellow-strip"><span className="strong white"><em>Miners</em></span> and <span className="strong white"><em>Automated buying</em></span> stay active while tab remains open.</p>

                        <div className="instruct-resources-container">
                            <div className="instruct-resource-inline">
                                <img src="/img/beam.webp" alt="" />
                                <p><span>Iron</span> is the basic resource, mined manually or with miners</p>
                            </div>
                            <div className="instruct-resource-inline">
                                <img src="/img/sulfur.webp" alt="" />
                                <p><span>Sulfur</span> costs 50 iron, consumed when mining silver</p>
                            </div>
                            <div className="instruct-resource-inline">
                                <img src="/img/drill.webp" alt="" />
                                <p><span>Drills</span>  cost 500 iron, consumed when mining silver</p>
                            </div>
                            <div className="instruct-resource-inline">
                                <img src="/img/silver.webp" alt="" />
                                <p><span>Silver</span> is the premium resource, used to buy silver miners</p>
                            </div>
                        </div>

                        <p className="stand-out-container yellow-strip"><span className="strong white"><em>Buttons</em></span> will appear <span className="strong white"><em>Deactivated</em></span> if you do not have the resources to buy or automate.</p>
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