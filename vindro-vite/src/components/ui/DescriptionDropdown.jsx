import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const DescriptionDropdown = ({ summary, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const onMouse = (e) => { if (!ref.current?.contains(e.target)) setIsOpen(false); };
        const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        document.addEventListener('mousedown', onMouse);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onMouse);
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen]);

    return (
        <div className="description-dropdown" ref={ref}>
            <button className={`description-toggle ${isOpen ? 'open' : 'closed'}`} onClick={() => setIsOpen(v => !v)}>
                <span>{summary}</span>
                <FaChevronDown className={`toggle-arrow${isOpen ? ' open' : ''}`} />
            </button>
            {isOpen && (
                <div className={`description-panel ${isOpen ? 'open' : 'closed'}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default DescriptionDropdown;
