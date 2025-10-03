import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

// --- CONFIGURATION ---
const INITIAL_TIME_PER_ROUND = 3.0;
const MIN_TIME_PER_ROUND = 1.2;
const ROUNDS_PER_GAME = 10;
const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
];

// --- TYPES ---
type GameScreen = 'intro' | 'playing' | 'finished';
type ColorData = { name: string; hex: string };
type Instruction = {
  text: string;
  color: string;
  correctAnswer: string;
  key: number;
};

// --- HELPER FUNCTIONS ---
const generateInstruction = (roundKey: number): Instruction => {
  const correctColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  let displayColor;
  do {
    displayColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  } while (displayColor.name === correctColor.name);

  const isEasy = Math.random() < 0.2;
  return {
    text: `Click ${correctColor.name}`,
    color: isEasy ? correctColor.hex : displayColor.hex,
    correctAnswer: correctColor.name,
    key: roundKey,
  };
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// --- MAIN PAGE COMPONENT ---
const ColorTrapPage = () => {
  const [screen, setScreen] = useState<GameScreen>('intro');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [buttons, setButtons] = useState<ColorData[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | '' | null>(null);
  const [gameLevel, setGameLevel] = useState(0);
  const [dynamicRoundTime, setDynamicRoundTime] = useState(INITIAL_TIME_PER_ROUND);

  const screenRef = useRef(null);
  const instructionRef = useRef(null);
  const scoreRef = useRef(null);

  const navigate = useNavigate();

  const handleExit = () => navigate('/');

  const handleRestart = () => {
    const newBaseTime = Math.max(MIN_TIME_PER_ROUND, INITIAL_TIME_PER_ROUND - gameLevel * 0.2);
    setDynamicRoundTime(newBaseTime);
    setScore(0);
    setRound(0);
    setScreen('playing');
    setTimeout(nextRound, 400);
  };

  const baseTimeForLevel = useCallback(() => {
    return Math.max(MIN_TIME_PER_ROUND, INITIAL_TIME_PER_ROUND - gameLevel * 0.2);
  }, [gameLevel]);

  const nextRound = useCallback(() => {
    setFeedback(null);
    if (round >= ROUNDS_PER_GAME) {
      setScreen('finished');
      return;
    }
    const roundKey = Date.now();
    const newInstruction = generateInstruction(roundKey);
    const shuffledButtons = shuffleArray(COLORS);
    setInstruction(newInstruction);
    setButtons(shuffledButtons);
    setRound(prev => prev + 1);
  }, [round]);

  const handleAnswer = (answer: string) => {
    if (feedback) return;

    if (answer === instruction?.correctAnswer) {
      setScore(prev => prev + 1);
      setFeedback('correct');
      setDynamicRoundTime(prev => Math.max(MIN_TIME_PER_ROUND, prev - 0.1));
    } else {
      setFeedback('incorrect');
      setDynamicRoundTime(prev => Math.min(baseTimeForLevel(), prev + 0.5));
    }
    setTimeout(nextRound, 400);
  };

  useEffect(() => {
    if (screen === 'playing' && round > 0) {
      const timerId = setTimeout(() => {
        setFeedback('incorrect');
        setDynamicRoundTime(baseTimeForLevel());
        setTimeout(nextRound, 400);
      }, dynamicRoundTime * 1000);

      return () => clearTimeout(timerId);
    }
  }, [screen, round, dynamicRoundTime, nextRound, baseTimeForLevel]);

  const startGame = () => {
    if (screen === 'finished') {
      setGameLevel(prev => prev + 1);
    }
    const newBaseTime = Math.max(MIN_TIME_PER_ROUND, INITIAL_TIME_PER_ROUND - (screen === 'finished' ? gameLevel + 1 : gameLevel) * 0.2);
    setDynamicRoundTime(newBaseTime);
    setScore(0);
    setRound(0);
    setScreen('playing');
    setTimeout(nextRound, 400);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'intro':
        return (
          <div ref={screenRef} className="w-full max-w-lg mx-auto text-center p-6 sm:p-10 rounded-xl border border-rialo-dark shadow-lg">
            <div className="mb-10 md:mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">🎨 Color Trap</h1>
              <p className="text-lg sm:text-xl text-rialo-dark/70">Click the word, not the color. Test your focus!</p>
            </div>
            <button onClick={startGame} className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95 text-white font-bold py-3 px-6 rounded-lg text-xl transition-all duration-150">
              Start Game
            </button>
          </div>
        );
      case 'finished':
        return (
          <div ref={screenRef} className="w-full max-w-lg mx-auto text-center p-6 sm:p-10 rounded-xl border border-rialo-dark shadow-lg">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Game Over!</h2>
            <p className="text-2xl sm:text-3xl mb-2">Final Score: <span className="font-bold text-yellow-400">{score}</span></p>
            <p className="text-base text-rialo-dark/70 mb-8">Next Level: {gameLevel + 1}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleExit} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-5 rounded-lg text-lg transition-all duration-150">
                Exit
              </button>
              <button onClick={handleRestart} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-5 rounded-lg text-lg transition-all duration-150">
                Restart Level
              </button>
              <button onClick={startGame} className="bg-green-500 hover:bg-green-600 active:bg-green-700 active:scale-95 text-white font-bold py-3 px-5 rounded-lg text-lg transition-all duration-150">
                Next Level
              </button>
            </div>
          </div>
        );
      case 'playing':
        return (
          <div ref={screenRef} className={`w-full max-w-2xl mx-auto text-center transition-colors duration-300 ${feedback === 'incorrect' ? 'bg-red-500/20' : ''} rounded-xl border border-rialo-dark shadow-lg p-4 sm:p-6`}>
            <div className="flex justify-between items-center mb-6 md:mb-8 text-base sm:text-xl">
              <div className="font-bold flex items-center">Score:
                <SwitchTransition>
                  <CSSTransition nodeRef={scoreRef} key={score} timeout={200} classNames="score-update" unmountOnExit>
                    <span ref={scoreRef} className="ml-2 w-8">{score}</span>
                  </CSSTransition>
                </SwitchTransition>
              </div>
              <div className="font-bold">Round: {round}/{ROUNDS_PER_GAME}</div>
            </div>
            <SwitchTransition>
              <CSSTransition nodeRef={instructionRef} key={instruction?.key} timeout={300} classNames="fade-up" unmountOnExit>
                <div ref={instructionRef} className="mb-8 md:mb-10 min-h-[70px] sm:min-h-[80px]">
                  {instruction && (
                    <h1 style={{ color: instruction.color }} className={`text-3xl sm:text-4xl md:text-5xl font-bold transition-transform duration-200 ${feedback === 'incorrect' ? 'animate-shake' : ''}`}>
                      {instruction.text}
                    </h1>
                  )}
                </div>
              </CSSTransition>
            </SwitchTransition>
            <div className="relative w-full h-1.5 bg-gray-300 rounded-full mb-8 md:mb-12">
              {instruction && <div key={instruction.key} className="absolute top-0 left-0 h-1.5 bg-yellow-400 rounded-full animate-countdown" style={{ animationDuration: `${dynamicRoundTime}s` }}></div>}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {buttons.map(color => (
                <button
                  key={color.name}
                  onClick={() => handleAnswer(color.name)}
                  className={`p-6 sm:p-8 rounded-lg text-xl sm:text-2xl font-bold text-white transition-all duration-150 transform active:scale-100 ${feedback === 'correct' && instruction?.correctAnswer === color.name ? 'animate-correct-pop' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color.hex }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-rialo-beige text-rialo-dark p-4 overflow-hidden">
      <SwitchTransition>
        <CSSTransition nodeRef={screenRef} key={screen} timeout={300} classNames="fade" unmountOnExit>
          <div ref={screenRef} className="w-full px-2 sm:px-4">
            {renderScreen()}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
};

export default ColorTrapPage;