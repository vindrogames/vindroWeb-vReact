// src/routes.js
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Story from './pages/Story';
import Brackets from './pages/Brackets';
import Games from './pages/Games';
import Contact from './pages/Contact';
import Register from './pages/Register';
import EscapeTheCloud from './features/escape-the-cloud/EscapeTheCloud';
import PrivacyCookies from './pages/PrivacyCookies';
import Game42 from './features/game-42/Game42';
import MadridCalculator from './features/madrid-calculator/MadridCalculator';
import Autominer from './features/autominer/AutoMiner';
import TestApi from './pages/TestApi';
import UserProfile from './pages/UserProfile';
import UserBrackets from './pages/UserBrackets';
import UserTopScores from './pages/UserTopScores';
import WorldCupTournament_2026 from './features/brackets/tournaments/world-cup-2026/WorldCupTournament_2026';
import WorldCup2026PlayPage from './features/brackets/tournaments/world-cup-2026/WorldCup2026PlayPage';

export const routes = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'register', element: <Register /> },
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
            // Protected User Routes
            {
                path: 'user/:userId',
                element: (
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'brackets/:tournament/:userId/:playName',
                element: (
                    < ProtectedRoute >
                        <WorldCup2026PlayPage />
                    </ProtectedRoute >
                ),
            },
            {
                path: 'user/:userId/brackets',
                element: (
                    <ProtectedRoute>
                        <UserBrackets />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'user/:userId/topScores',
                element: (
                    <ProtectedRoute>
                        <UserTopScores />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);