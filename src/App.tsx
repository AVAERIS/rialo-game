import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SnakePage from './pages/SnakePage';

function App() {
  return (
    <div className="bg-rialo-beige text-rialo-dark min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snake" element={<SnakePage />} />
      </Routes>
    </div>
  );
}

export default App;
