import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './Header';
import Footer from './Footer';
import { useAuth } from '../../contexts/auth/AuthContext';
import WelcomeUserModal from '../ui/WelcomeUserModal';

const PageLoader = () => (
    <div className="global-loader-overlay">
        <div className="apple-spinner">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="bar" />
            ))}
        </div>
    </div>
);

const Layout = () => {
    const location = useLocation();
    const { showWelcomeModal, dismissWelcomeModal } = useAuth();

    const isMadrid = location.pathname.includes('madrid-calculator');
    const themeClass = isMadrid ? 'madrid-theme' : 'default-theme';

    return (
        <div className={`app-shell ${themeClass}`}>
            <NavBar isMadrid={isMadrid} />

            <Suspense fallback={<PageLoader />}>
                <Outlet />
            </Suspense>

            <Footer isMadrid={isMadrid} />

            {showWelcomeModal && (
                <WelcomeUserModal onClose={dismissWelcomeModal} />
            )}
        </div>
    );
};

export default Layout;
