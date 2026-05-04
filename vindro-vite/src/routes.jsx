// src/routes.js
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';

const Home                  = lazy(() => import('./pages/Home'));
const Story                 = lazy(() => import('./pages/Story'));
const Brackets              = lazy(() => import('./pages/Brackets'));
const Games                 = lazy(() => import('./pages/Games'));
const Contact               = lazy(() => import('./pages/Contact'));
const EscapeTheCloud        = lazy(() => import('./features/escape-the-cloud/EscapeTheCloud'));
const PrivacyCookies        = lazy(() => import('./pages/PrivacyCookies'));
const Game42                = lazy(() => import('./features/game-42/Game42'));
const MadridCalculator      = lazy(() => import('./features/madrid-calculator/MadridCalculator'));
const Autominer             = lazy(() => import('./features/autominer/AutoMiner'));
const TestApi               = lazy(() => import('./pages/TestApi'));
const UserProfile           = lazy(() => import('./pages/UserProfile'));
const WorldCupTournament_2026 = lazy(() => import('./features/brackets/tournaments/world-cup-2026/WorldCupTournament_2026'));
const PlayPage              = lazy(() => import('./features/brackets/pages/PlayPage'));
const PoolPage              = lazy(() => import('./features/brackets/pages/PoolPage'));
const NotFoundPage          = lazy(() => import('./pages/NotFoundPage'));

export const routes = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'story', element: <Story /> },
            { path: 'brackets', element: <Brackets /> },
            { path: 'games', element: <Games /> },
            { path: 'contact', element: <Contact /> },
            { path: 'games/escape-the-cloud', element: <EscapeTheCloud /> },
            { path: 'privacy-cookies', element: <PrivacyCookies /> },
            { path: 'games/game-42', element: <Game42 /> },
            { path: 'games/madrid-calculator', element: <MadridCalculator /> },
            { path: 'test-api', element: <TestApi /> },
            { path: 'games/auto-miner', element: <Autominer /> },
            { path: 'brackets/world-cup-2026', element: <WorldCupTournament_2026 /> },
            { path: 'brackets/:tournament/:userId/:playName', element: <PlayPage />},
            { path: 'brackets/:tournament/pool/:poolName', element: <PoolPage /> },
            { path: 'user/:userId', element: <UserProfile /> },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);