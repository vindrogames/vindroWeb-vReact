import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Story from './pages/Story.jsx';
import Blog from './pages/Blog';
import Games from './pages/Games';
import Contact from "./pages/Contact";
import EscapeTheCloud from './pages/EscapeTheCloud.jsx';

import './scss/main.scss';

function App() {

  const router = createBrowserRouter([
    { path: '/', element: <><Header /><Home /></> },
    { path: '/story', element: <><Header /><Story /></>},
    { path: '/blog', element: <><Header /><Blog /></>},
    { path: '/games', element: <><Header /><Games /></>},
    { path: '/contact', element: <><Header /><Contact /></>},
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
