import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './Header'; // Your NavBar component
import Footer from './Footer';

export default function Layout() {
    const location = useLocation();
    
    // Returns true if the URL contains 'madrid-calculator'
    const isMadrid = location.pathname.includes('madrid-calculator');
    const themeClass = isMadrid ? 'madrid-theme' : 'default-theme';

    return (
        <div className={`app-shell ${themeClass}`}>
            {/* We pass isMadrid as a prop so the NavBar can swap the logo */}
            <NavBar isMadrid={isMadrid} />
            
            <Outlet /> 
            
            <Footer isMadrid={isMadrid} />
        </div>
    );
}