// src/routes.js
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Story from './pages/Story';
import Brackets from './pages/Brackets';
import Games from './pages/Games';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import EscapeTheCloud from './features/escape-the-cloud/EscapeTheCloud';
import PrivacyCookies from './pages/PrivacyCookies';
import Game42 from './features/game-42/Game42';
import MadridCalculator from './features/madrid-calculator/MadridCalculator';
import TestApi from './pages/TestApi';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'story', element: <Story /> },
      { path: 'brackets', element: <Brackets /> },
      { path: 'games', element: <Games /> },
      { path: 'contact', element: <Contact /> },
      { path: 'games/escape-the-cloud', element: <EscapeTheCloud /> },
      { path: 'privacy-cookies', element: <PrivacyCookies />},
      { path: 'games/game-42', element: <Game42 />},
      { path: 'games/madrid-calculator', element: <MadridCalculator />},
      { path: 'test-api', element: <TestApi />}
    ],
  },
]);