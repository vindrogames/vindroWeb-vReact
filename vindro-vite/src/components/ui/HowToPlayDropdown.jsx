import React, { useState, useRef, useEffect } from "react";

export default function HowToPlayDropdown({
    className = "",
    id,
    text,
    isOpen: controlledOpen,
    onToggle
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const containerRef = useRef(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    // Handle Closing on Outside Click
    useEffect(() => {
        if (!open) return;

        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                if (isControlled && onToggle) {
                    onToggle(false);
                } else {
                    setInternalOpen(false);
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, isControlled, onToggle]);

    const handleToggle = () => {
        if (isControlled && onToggle) {
            onToggle(!open);
        } else {
            setInternalOpen(!open);
        }
    };

    const contentId = id ? `${id}-content` : undefined;

    return (
        <div className={`how-to-play-container ${className}`} id={id} ref={containerRef}>
            <button
                type="button"
                className={`how-to-play-toggle btn ${open ? "active" : ""}`}
                onClick={handleToggle}
                aria-expanded={open}
                aria-controls={contentId}
            >
                {open ? (
                    <>
                        <span>Close Menu</span>
                        <span>❌</span>
                    </>
                ) : (
                    <>
                        <span>How to play</span>
                        <span>🧐</span>
                    </>
                )}
            </button>

            <div
                id={contentId}
                className={`how-to-play-content ${open ? "open" : "closed"}`}
                role="region"
                aria-hidden={!open}
            >
                {text}
            </div>
        </div>
    );
}