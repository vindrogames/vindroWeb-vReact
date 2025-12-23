// src/App.jsx
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { AuthProvider } from './contexts/AuthContext';

import './scss/main.scss';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <RouterProvider router={routes} />
      </AuthProvider>
    </HelmetProvider>
  );
}
