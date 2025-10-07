import { useTransition } from '../context/TransitionContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import NebulaBackground from '../components/NebulaBackground';


const GRID_SIZE = 20;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const INITIAL_SPEED_MS = 100;
const MIN_SPEED_MS = 40;
const SPEED_INCREMENT = 2;
const MOBILE_BREAKPOINT = 768;


type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type SnakeSegment = { x: number; y: number };
type FoodItem = { x: number; y: number };

const getInitialSnake = () => [
  { x: 15, y: 15 },
  { x: 15, y: 16 },
  { x: 15, y: 17 },
  { x: 15, y: 18 },
  { x: 15, y: 19 },
];

const SnakePage = () => {
  const { startTransition } = useTransition();
  
  const [snake, setSnake] = useState<SnakeSegment[]>(getInitialSnake());
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [speed, setSpeed] = useState(INITIAL_SPEED_MS);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);
  const directionQueueRef = useRef<Direction[]>([]);
  const foodImageRef = useRef<HTMLImageElement | null>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  
  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  
  const queueDirectionChange = useCallback((newDirection: Direction | null) => {
    if (isPaused && !isGameOver) {
      setIsPaused(false);
      return;
    }
    if (isGameOver || !newDirection) return;
    if (directionQueueRef.current.length < 2) {
      directionQueueRef.current.push(newDirection);
    }
  }, [isPaused, isGameOver]);

  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const start = touchStartRef.current;
      const end = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };

      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const swipeThreshold = 30; 

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        
        if (Math.abs(deltaX) > swipeThreshold) {
          queueDirectionChange(deltaX > 0 ? 'RIGHT' : 'LEFT');
        }
      } else {
        
        if (Math.abs(deltaY) > swipeThreshold) {
          queueDirectionChange(deltaY > 0 ? 'DOWN' : 'UP');
        }
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [queueDirectionChange]);

  
  const generateFoodBatch = useCallback(() => {
    setSnake(currentSnake => {
      const newFoods: FoodItem[] = [];
      const foodCount = Math.floor(Math.random() * 4) + 2; 
      let attempts = 0;
      while (newFoods.length < foodCount && attempts < 50) {
        const newFoodPosition = {
          x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
          y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
        };
        const isOnSnake = currentSnake.some(s => s.x === newFoodPosition.x && s.y === newFoodPosition.y);
        const isOnFood = newFoods.some(f => f.x === newFoodPosition.x && f.y === newFoodPosition.y);
        if (!isOnSnake && !isOnFood) {
          newFoods.push(newFoodPosition);
        }
        attempts++;
      }
      setFoods(newFoods);
      return currentSnake;
    });
  }, []);

  const resetGame = useCallback(() => {
    setSnake(getInitialSnake());
    setDirection('UP');
    directionQueueRef.current = [];
    setSpeed(INITIAL_SPEED_MS);
    setIsGameOver(false);
    setScore(0);
    generateFoodBatch();
    setIsPaused(true);
  }, [generateFoodBatch]);

  useEffect(() => {
    if (!isPaused) {
      generateFoodBatch();
    }
  }, [isPaused, generateFoodBatch]);

  const timestampRef = useRef<number>(0);

  
  const gameLoop = useCallback((timestamp: number) => {
    if (isGameOver || isPaused) return;
    timestampRef.current = timestamp;

    
    setParticles(prevParticles =>
      prevParticles.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        alpha: p.alpha - 0.02,
      })).filter(p => p.alpha > 0)
    );

    if (timestamp - lastUpdateTimeRef.current > speed) {
      lastUpdateTimeRef.current = timestamp;

      if (directionQueueRef.current.length > 0) {
        const nextDir = directionQueueRef.current.shift();
        if (nextDir) setDirection(nextDir);
      }

      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        
        if (head.x < 0) head.x = (CANVAS_WIDTH / GRID_SIZE) - 1;
        if (head.x >= CANVAS_WIDTH / GRID_SIZE) head.x = 0;
        if (head.y < 0) head.y = (CANVAS_HEIGHT / GRID_SIZE) - 1;
        if (head.y >= CANVAS_HEIGHT / GRID_SIZE) head.y = 0;

        newSnake.unshift(head);

        
        for (let i = 1; i < newSnake.length; i++) {
          if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
            setIsGameOver(true);
            return prevSnake;
          }
        }

        
        const foodIndex = foods.findIndex(f => f.x === head.x && f.y === head.y);
        if (foodIndex !== -1) {
          const eatenFood = foods[foodIndex];
          
          
          const headHue = (timestampRef.current / 20) % 360;
          const headColor = `hsl(${headHue}, 80%, 70%)`;

          for (let i = 0; i < 15; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const particleSpeed = Math.random() * 3 + 1;
            setParticles(prev => [...prev, {
              x: eatenFood.x * GRID_SIZE + GRID_SIZE / 2,
              y: eatenFood.y * GRID_SIZE + GRID_SIZE / 2,
              vx: Math.cos(angle) * particleSpeed,
              vy: Math.sin(angle) * particleSpeed,
              radius: Math.random() * 2 + 1,
              alpha: 1,
              color: headColor,
            }]);
          }

          
          newSnake.push({ ...newSnake[newSnake.length - 1] });

          setScore(s => s + 1);
          setSpeed(s => Math.max(MIN_SPEED_MS, s - SPEED_INCREMENT));
          
          const newFoods = foods.filter((_, index) => index !== foodIndex);
          if (newFoods.length === 0) {
            generateFoodBatch();
          } else {
            setFoods(newFoods);
          }
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isGameOver, isPaused, speed, direction, foods, generateFoodBatch]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      lastUpdateTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [isPaused, isGameOver, gameLoop]);

  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a'; 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (foodImageRef.current) {
      const foodSize = GRID_SIZE;
      foods.forEach(food => {
        const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;

        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, foodSize / 2, 0, 2 * Math.PI);
        ctx.fill();

        
        ctx.drawImage(foodImageRef.current!, centerX - foodSize / 2, centerY - foodSize / 2, foodSize, foodSize);
      });
    }

              
              snake.forEach((segment, index) => {
                const radius = GRID_SIZE / 2;
                const centerX = segment.x * GRID_SIZE + radius;
                const centerY = segment.y * GRID_SIZE + radius;
          
                
                const hue = (timestampRef.current / 20 + index * 10) % 360;
                ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
                
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
          
                
                ctx.strokeStyle = '#0f172a'; 
                ctx.lineWidth = 2;
                ctx.stroke();
          
                
                      if (index === 0) {
                        ctx.fillStyle = '#1E293B'; 
                        const eyeRadius = GRID_SIZE / 8;
                        let eye1X, eye1Y, eye2X, eye2Y;
                        switch (direction) {
                          case 'UP':
                            eye1X = centerX - GRID_SIZE / 4; eye1Y = centerY - GRID_SIZE / 4;
                            eye2X = centerX + GRID_SIZE / 4; eye2Y = centerY - GRID_SIZE / 4;
                            break;
                          case 'DOWN':
                            eye1X = centerX - GRID_SIZE / 4; eye1Y = centerY + GRID_SIZE / 4;
                            eye2X = centerX + GRID_SIZE / 4; eye2Y = centerY + GRID_SIZE / 4;
                            break;
                          case 'LEFT':
                            eye1X = centerX - GRID_SIZE / 4; eye1Y = centerY - GRID_SIZE / 4;
                            eye2X = centerX - GRID_SIZE / 4; eye2Y = centerY + GRID_SIZE / 4;
                            break;
                          case 'RIGHT':
                            eye1X = centerX + GRID_SIZE / 4; eye1Y = centerY - GRID_SIZE / 4;
                            eye2X = centerX + GRID_SIZE / 4; eye2Y = centerY + GRID_SIZE / 4;
                            break;
                        }
                        ctx.beginPath(); ctx.arc(eye1X, eye1Y, eyeRadius, 0, 2 * Math.PI); ctx.fill();
                        ctx.beginPath(); ctx.arc(eye2X, eye2Y, eyeRadius, 0, 2 * Math.PI); ctx.fill();
                      }              });    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    
    if (isPaused && !isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

  }, [snake, foods, isPaused, isGameOver, direction, particles]);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentDirection = directionQueueRef.current.length > 0 ? directionQueueRef.current[directionQueueRef.current.length - 1] : direction;
      let newDirection: Direction | null = null;

      switch (e.key) {
        case 'ArrowUp': case 'w': if (currentDirection !== 'DOWN') newDirection = 'UP'; break;
        case 'ArrowDown': case 's': if (currentDirection !== 'UP') newDirection = 'DOWN'; break;
        case 'ArrowLeft': case 'a': if (currentDirection !== 'RIGHT') newDirection = 'LEFT'; break;
        case 'ArrowRight': case 'd': if (currentDirection !== 'LEFT') newDirection = 'RIGHT'; break;
      }
      queueDirectionChange(newDirection);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, queueDirectionChange]);

  
  useEffect(() => {
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => { foodImageRef.current = img; };
  }, []);


  return (
    <div className="relative w-full min-h-screen bg-black">
      <NebulaBackground />
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen p-4 font-sans">
        <main className="bg-slate-800/70 backdrop-blur-xl border border-white/10 w-full max-w-lg md:max-w-xl rounded-2xl shadow-2xl shadow-sky-500/10 p-4 sm:p-6 flex flex-col">
          
          <header className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-100">Snake Game</h1>
          </header>

          <div className="w-full bg-slate-900/50 border border-white/10 p-3 rounded-lg text-center mb-4">
            <span className="text-lg font-semibold text-slate-200 tracking-wider">SCORE: {score}</span>
          </div>

          <div className="w-full rounded-xl overflow-hidden aspect-square shadow-inner bg-slate-900">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="block w-full h-auto"
              onClick={() => isPaused && !isGameOver && setIsPaused(false)}
            >
              Your browser does not support the canvas.
            </canvas>
          </div>

          <footer className="text-center mt-4 pt-2">
            {isMobile && <p className="text-sm text-slate-400">Swipe on the screen to move.</p>}
          </footer>
          
        </main>

        <footer className="text-center mt-6">
          <button onClick={() => startTransition('/')} className="text-sm text-slate-400 underline hover:text-slate-200 transition-colors">Back to Home</button>
        </footer>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center transition-opacity duration-300 z-50 p-4">
            <div className="bg-slate-800/80 border border-white/10 p-8 rounded-xl text-center shadow-2xl max-w-sm w-full">
              <h2 className="text-4xl font-bold mb-2 text-slate-100 text-shadow">Game Over!</h2>
              <p className="text-xl mb-6 text-slate-300 text-shadow">Final Score: {score}</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors">Restart</button>
                <button onClick={() => startTransition('/')} className="px-6 py-2 bg-slate-700 font-semibold rounded-lg hover:bg-slate-600 transition-colors">Back to Home</button>
              </div>
            </div>
          </div> 
        )}
      </div>
    </div>
  );
};

export default SnakePage;