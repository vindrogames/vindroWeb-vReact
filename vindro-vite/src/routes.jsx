// src/routes.js
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';

import Home from './pages/Home';
import Story from './pages/Story';
import Blog from './pages/Blog';
import Games from './pages/Games';
import Contact from './pages/Contact';
import EscapeTheCloud from './features/escape-the-cloud/EscapeTheCloud';
import PrivacyCookies from './pages/PrivacyCookies';
import Game42 from './features/game-42/Game42';
import TestApi from './pages/TestApi';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'story', element: <Story /> },
      { path: 'blog', element: <Blog /> },
      { path: 'games', element: <Games /> },
      { path: 'contact', element: <Contact /> },
      { path: 'games/escape-the-cloud', element: <EscapeTheCloud /> },
      { path: 'privacy-cookies', element: <PrivacyCookies />},
      { path: 'games/game-42', element: <Game42 />},
      { path: 'test-api', element: <TestApi />}
    ],
  },
]);