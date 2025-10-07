import React, { useState, useEffect } from 'react';
import RialoBounceCanvas, { GameState } from '../components/RialoBounceCanvas';
import { useTransition } from '../context/TransitionContext';
import NebulaBackground from '../components/NebulaBackground';

const RialoBouncePage: React.FC = () => {
  const { startTransition } = useTransition();
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('waiting');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black">
      <NebulaBackground />
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen p-4 font-sans">
        <main className="bg-slate-800/70 backdrop-blur-xl border border-white/10 w-full max-w-lg md:max-w-xl rounded-2xl shadow-2xl shadow-sky-500/10 p-4 sm:p-6 flex flex-col items-center">
          
          <header className="text-center mb-4">
            <h1 
              className="text-4xl sm:text-5xl font-bold text-white"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Rialo Bounce
            </h1>
          </header>

          <div className={`w-full bg-slate-900/50 border border-white/10 p-3 rounded-lg text-center mb-4 ${gameState === 'playing' ? 'visible' : 'invisible'}`}>
            <span className="text-lg font-semibold text-slate-200 tracking-wider">SCORE: {score}</span>
          </div>

          <div className="w-full rounded-xl overflow-hidden aspect-square shadow-inner bg-slate-900">
            <RialoBounceCanvas
              setScore={setScore}
              gameState={gameState}
              setGameState={setGameState}
            />
          </div>

        </main>

        <footer className="text-center mt-6">
          <button onClick={() => startTransition('/')} className="text-sm text-slate-400 underline hover:text-slate-200 transition-colors">
            Back to Home
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RialoBouncePage;