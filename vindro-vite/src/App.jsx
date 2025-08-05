// src/App.jsx
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { routes } from './routes';

import './scss/main.scss';

export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={routes} />
    </HelmetProvider>
  );
}
