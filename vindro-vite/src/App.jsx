import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Games from './pages/Games';
import Contact from "./pages/Contact";
import EscapeTheCloud from './pages/EscapeTheCloud';
import './App.css';
import './scss/main.scss';

function App() {

  const router = createBrowserRouter([
    { path: '/', element: <><Header /><Home /></> },
    { path: '/contact', element: <><Header /><Contact /></>},
    { path: '/games', element: <><Header /><Games /></>},
    { path: '/games/escape-the-cloud', element: <><Header /><EscapeTheCloud /></>}

  ]);

  return (
    <>
      <HelmetProvider>
        <RouterProvider router={ router } />
        <Footer />
      </HelmetProvider>
    </>
  )
}

export default App
