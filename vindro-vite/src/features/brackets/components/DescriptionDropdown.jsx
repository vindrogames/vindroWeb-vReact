import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const DescriptionDropdown = ({ summary, children, onOpenChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    const setOpen = (val) => {
        const next = typeof val === 'function' ? val(isOpen) : val;
        setIsOpen(next);
        onOpenChange?.(next);
    };

    useEffect(() => {
        if (!isOpen) return;
        const onMouse = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onMouse);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onMouse);
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen]);

    return (
        <div className="description-dropdown" ref={ref}>
            <button className={`description-toggle ${isOpen ? 'open' : 'closed'}`} onClick={() => setOpen(v => !v)}>
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
