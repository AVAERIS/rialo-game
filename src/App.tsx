import { Routes, Route, useLocation } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useRef } from "react";
import HomePage from "./pages/HomePage";
import SnakePage from "./pages/SnakePage";
import ColorTrapPage from "./pages/ColorTrapPage";

function App() {
  const location = useLocation();
  const nodeRef = useRef(null);

  return (
    <div className="bg-rialo-beige text-rialo-dark min-h-screen font-sans relative">
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.key}
          classNames="page-slide"
          timeout={400}
          nodeRef={nodeRef}
          unmountOnExit
        >
          <div ref={nodeRef} className="absolute w-full">
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/snake" element={<SnakePage />} />
              <Route path="/color-trap" element={<ColorTrapPage />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

export default App;
