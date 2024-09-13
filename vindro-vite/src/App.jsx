import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Home from "./pages/Home";
import './App.css';
import './scss/main.scss';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <HelmetProvider>
        <Home />
      </HelmetProvider>
    </>
  )
}

export default App
