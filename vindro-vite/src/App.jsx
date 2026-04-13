// src/App.jsx
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { AuthProvider } from './contexts/auth/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';

import 'flag-icons/css/flag-icons.min.css';
import './scss/main.scss';
import './scss/_brackets.scss';

export default function App() {
    return (
        <HelmetProvider>
            <LoadingProvider >
                <AuthProvider>
                    <RouterProvider router={routes} />
                </AuthProvider>
            </LoadingProvider>
        </HelmetProvider>
    );
}
