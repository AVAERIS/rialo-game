import { useState, useEffect, useCallback, useRef } from 'react';
import { useTransition } from '../context/TransitionContext';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import CircularTimer from '../components/CircularTimer';
import NebulaBackground from '../components/NebulaBackground';


const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'ORANGE', hex: '#f97316' },
  { name: 'PINK', hex: '#ec4899' },
  { name: 'CYAN', hex: '#06b6d4' },
];
const BASE_PROGRESS_RATE = 0.11; 
const CORRECT_ANSWER_BONUS = 13; 
const INCORRECT_ANSWER_PENALTY = 5; 


type ColorData = { name: string; hex: string; randomBg: string; };
type Instruction = {
  text: string;
  color: string;
  correctAnswer: string;
  key: number;
};


const generateInstruction = (roundKey: number): Instruction => {
  const correctColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  const displayColor = COLORS[Math.floor(Math.random() * COLORS.length)];

  return {
    text: correctColor.name,
    color: displayColor.hex,
    correctAnswer: correctColor.name,
    key: roundKey,
  };
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};


const ColorTrapPage = () => {
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [buttons, setButtons] = useState<ColorData[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | '' | null>(null);
  const [gameLevel, setGameLevel] = useState(0);
  const [progress, setProgress] = useState(0);

  const instructionRef = useRef(null);
  const scoreRef = useRef(null);
  const gameLoopRef = useRef<number>();

  const { startTransition } = useTransition();
  const handleExit = () => startTransition('/');

  const progressRate = useCallback(() => {
    return BASE_PROGRESS_RATE + gameLevel * 0.02;
  }, [gameLevel]);

  function nextRound() {
    setFeedback(null);
    const roundKey = Date.now();
    const newInstruction = generateInstruction(roundKey);
    
    
    const buttonTextColors = shuffleArray(COLORS);
    const buttonBgColors = shuffleArray(COLORS);

    const shuffledButtons = buttonTextColors.map((textColor, index) => {
      let bgColor = buttonBgColors[index];
      
      if (textColor.name === bgColor.name) {
        const nextIndex = (index + 1) % buttonBgColors.length;
        bgColor = buttonBgColors[nextIndex];
      }
      return { ...textColor, randomBg: bgColor.hex };
    });

    setInstruction(newInstruction);
    setButtons(shuffledButtons);
  }

  function unpauseGame() {
    
    if (isPaused && !isGameOver) {
      setIsPaused(false);
      nextRound();
      return;
    }

    
    if (isGameOver) {
      setGameLevel(prev => prev + 1);
      setScore(0);
      setProgress(0);
      setIsGameOver(false);
      setIsPaused(false); 
      nextRound();
      return;
    }
  }

  function handleAnswer(answer: string) {
    if (feedback || isPaused || isGameOver) return;

    if (answer === instruction?.correctAnswer) {
      setScore(prev => prev + 1);
      setFeedback('correct');
      setProgress(p => Math.max(0, p - CORRECT_ANSWER_BONUS));
    } else {
      setFeedback('incorrect');
      setProgress(p => Math.min(100, p + INCORRECT_ANSWER_PENALTY));
    }
    setTimeout(nextRound, 200);
  }

  
  useEffect(() => {
    const loop = () => {
      if (!isPaused && !isGameOver) {
        setProgress(p => {
          const newProgress = p + progressRate();
          if (newProgress >= 100) {
            setIsGameOver(true);
            return 100;
          }
          return newProgress;
        });
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPaused, isGameOver, progressRate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <NebulaBackground />
      <main className="bg-slate-800/70 backdrop-blur-xl border border-white/10 w-full max-w-lg md:max-w-xl rounded-2xl shadow-2xl shadow-sky-500/10 p-4 sm:p-6 flex flex-col">
        <div className={`w-full text-center transition-colors duration-300 rounded-xl`}>
            <div className="flex justify-center items-center mb-6 md:mb-8 text-base sm:text-xl text-slate-200">
              <div className="font-bold flex items-center">Score:
                <SwitchTransition>
                  <CSSTransition nodeRef={scoreRef} key={score} timeout={200} classNames="score-update" unmountOnExit>
                    <span ref={scoreRef} className="ml-2 w-8">{score}</span>
                  </CSSTransition>
                </SwitchTransition>
              </div>
            </div>
            <div ref={instructionRef} className="mb-4 md:mb-6 flex flex-col items-center justify-center">
              <div className="h-28 sm:h-32 flex items-center justify-center">
                <CircularTimer progress={progress} />
              </div>
              <div className="min-h-[70px] sm:min-h-[80px] flex items-center justify-center">
                {instruction && (
                  <h1 style={{ color: instruction.color }} className={`text-3xl sm:text-4xl md:text-5xl font-bold transition-transform duration-200 ${feedback === 'incorrect' ? 'animate-shake' : ''}`}>
                    {instruction.text}
                  </h1>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {buttons.length > 0 ? buttons.map(buttonData => (
                <button
                  key={buttonData.name}
                  onClick={() => handleAnswer(buttonData.name)}
                  className={`p-3 sm:p-4 rounded-lg text-lg sm:text-xl font-bold text-white transition-all duration-150 transform active:scale-100 h-[81px] sm:h-[97px] flex items-center justify-center ${feedback === 'correct' && instruction?.correctAnswer === buttonData.name ? 'animate-correct-pop' : 'hover:scale-105'}`}
                  style={{ backgroundColor: buttonData.randomBg }}
                >
                  {buttonData.name}
                </button>
              )) : COLORS.map(color => (
                <div key={color.name} className="p-3 sm:p-4 rounded-lg h-[81px] sm:h-[97px] bg-gray-500/20 animate-pulse" />
              ))}
            </div>
        </div>

        {isPaused && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center cursor-pointer rounded-2xl" onClick={unpauseGame}>
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-white text-shadow">🎨 Color Trap</h2>
                    <p className="text-xl text-slate-300 mt-2">Click to Start</p>
                </div>
            </div>
        )}
      </main>
      
      <footer className="relative z-10 text-center mt-6">
          <button onClick={handleExit} className="text-sm text-slate-400 underline hover:text-slate-200 transition-colors">Back to Home</button>
      </footer>

      {isGameOver && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center transition-opacity duration-300 z-50 p-4">
          <div className="bg-slate-800/80 border border-white/10 p-8 rounded-xl text-center shadow-2xl max-w-sm w-full">
            <h2 className="text-3xl font-bold mb-2 text-slate-100">Game Over!</h2>
            <p className="text-xl mb-6 text-slate-300">Final Score: {score}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleExit} className="px-6 py-2 bg-slate-700 font-semibold rounded-lg hover:bg-slate-600 transition-colors">Back to Home</button>
              <button onClick={unpauseGame} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors">Play Again</button>
            </div>
          </div>
        </div> 
      )}
    </div>
  );
};

export default ColorTrapPage;