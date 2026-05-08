// src/App.jsx
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { AuthProvider } from './contexts/auth/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';

// Self-hosted variable fonts — loaded once, bundled with Vite, cached permanently
import '@fontsource-variable/montserrat';
import '@fontsource-variable/montserrat/wght-italic.css';
import '@fontsource-variable/open-sans';
import '@fontsource-variable/open-sans/wght-italic.css';

import 'flag-icons/css/flag-icons.min.css';
import './scss/main.scss';

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
