import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const LoadingContext = createContext();
const MIN_DURATION = 840;

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const startTimeRef = useRef(null);
    const hideTimerRef = useRef(null);

    const showLoader = () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        startTimeRef.current = Date.now();
        setIsLoading(true);
    };

    const hideLoader = () => {
        const elapsed = Date.now() - (startTimeRef.current || 0);
        const remaining = Math.max(0, MIN_DURATION - elapsed);
        return new Promise(resolve => {
            hideTimerRef.current = setTimeout(() => {
                setIsLoading(false);
                resolve();
            }, remaining);
        });
    };

    return (
        <LoadingContext.Provider value={{ showLoader, hideLoader }}>
            {children}
            {isLoading && <GlobalLoaderPortal />}
        </LoadingContext.Provider>
    );
};

const GlobalLoaderPortal = () => {
    // Safety check: Ensure we are in the browser
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent scrolling when loader is active
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!mounted) return null;

    return ReactDOM.createPortal(
        <div className="global-loader-overlay">
            <div className="apple-spinner">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="bar"></div>
                ))}
            </div>
        </div>,
        document.body
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};