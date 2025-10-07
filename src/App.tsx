import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { TransitionContext } from './context/TransitionContext';
import { TransitionOverlay } from './components/TransitionOverlay';
import HomePage from "./pages/HomePage";
import SnakePage from "./pages/SnakePage";
import ColorTrapPage from "./pages/ColorTrapPage";
import RialoBouncePage from "./pages/RialoBouncePage";

function App() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const startTransition = (to: string) => {
    if (location.pathname === to) return;
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(to);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 200); 
  };

  return (
    <TransitionContext.Provider value={{ startTransition }}>
      <div className="bg-rialo-beige text-rialo-dark min-h-screen font-sans">
        <AnimatePresence>
          {isTransitioning && <TransitionOverlay />}
        </AnimatePresence>

        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/snake" element={<SnakePage />} />
          <Route path="/color-trap" element={<ColorTrapPage />} />
          <Route path="/rialo-bounce" element={<RialoBouncePage />} />
        </Routes>
      </div>
    </TransitionContext.Provider>
  );
}

export default App;