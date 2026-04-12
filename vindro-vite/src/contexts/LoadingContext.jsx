import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const showLoader = () => setIsLoading(true);
    const hideLoader = () => setIsLoading(false);

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