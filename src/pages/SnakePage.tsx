import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';

// --- Game Constants ---
const GRID_SIZE = 20;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const INITIAL_SPEED_MS = 120;
const MIN_SPEED_MS = 40;
const SPEED_INCREMENT = 3;
const MOBILE_BREAKPOINT = 768;

// --- Types ---
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type SnakeSegment = { x: number; y: number };
type FoodItem = { x: number; y: number };
type Prank = 'SPEED_UP' | 'SLOW_DOWN' | 'GET_FAT' | 'GET_SLIM' | 'REVERSE_CONTROLS' | 'GHOST_MODE' | 'NORMAL';

const PRANKS: Prank[] = ['SPEED_UP', 'SLOW_DOWN', 'GET_FAT', 'GET_SLIM', 'REVERSE_CONTROLS', 'GHOST_MODE', 'NORMAL', 'NORMAL', 'NORMAL'];

const getInitialSnake = () => [
  { x: 15, y: 15 },
  { x: 15, y: 16 },
  { x: 15, y: 17 },
];

const SnakePage = () => {
  // --- State Management ---
  const [snake, setSnake] = useState<SnakeSegment[]>(getInitialSnake());
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [speed, setSpeed] = useState(INITIAL_SPEED_MS);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [activePrank, setActivePrank] = useState<Prank | 'NONE'>('NONE');
  const [prankTimer, setPrankTimer] = useState(0);
  const [snakeWidth, setSnakeWidth] = useState(GRID_SIZE);
  const [isReversed, setIsReversed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);
  const directionQueueRef = useRef<Direction[]>([]);
  const foodImageRef = useRef<HTMLImageElement | null>(null);

  // --- Mobile Detection ---
  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // --- Input Handling ---
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

  // --- Helper Functions ---
  const generateFoodBatch = useCallback(() => {
    const newFoods: FoodItem[] = [];
    const foodCount = Math.floor(Math.random() * 3) + 3; // Randomly 3 to 5 foods
    setSnake(currentSnake => {
      let attempts = 0;
      while (newFoods.length < foodCount && attempts < 50) {
        const newFoodPosition = {
          x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
          y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
        };
        const isOnSnake = currentSnake.some(s => s.x === newFoodPosition.x && s.y === newFoodPosition.y);
        const isTooClose = newFoods.some(f => f.x === newFoodPosition.x && f.y === newFoodPosition.y);
        if (!isOnSnake && !isTooClose) {
          newFoods.push(newFoodPosition);
        }
        attempts++;
      }
      setFoods(newFoods);
      return currentSnake;
    });
  }, []);

  const resetPranks = useCallback(() => {
    setActivePrank('NONE');
    setSpeed(Math.max(MIN_SPEED_MS, INITIAL_SPEED_MS - (Math.floor(score / 5) * SPEED_INCREMENT * 5)));
    setSnakeWidth(GRID_SIZE);
    setIsReversed(false);
  }, [score]);

  const applyPrank = useCallback(() => {
    const prank = PRANKS[Math.floor(Math.random() * PRANKS.length)];
    setActivePrank(prank);
    setPrankTimer(5000 / speed);
    switch (prank) {
      case 'SPEED_UP': setSpeed(s => Math.max(MIN_SPEED_MS, s / 2)); break;
      case 'SLOW_DOWN': setSpeed(s => s * 1.5); break;
      case 'GET_FAT': setSnakeWidth(GRID_SIZE * 1.5); break;
      case 'REVERSE_CONTROLS': setIsReversed(true); break;
    }
  }, [speed]);

  const resetGame = useCallback(() => {
    setSnake(getInitialSnake());
    setDirection('UP');
    directionQueueRef.current = [];
    setSpeed(INITIAL_SPEED_MS);
    setIsGameOver(false);
    setScore(0);
    resetPranks();
    generateFoodBatch();
    setIsPaused(true);
  }, [generateFoodBatch, resetPranks]);

  useEffect(() => {
      if(!isPaused) generateFoodBatch();
  }, [isPaused, generateFoodBatch]);

  // --- Game Loop ---
  const gameLoop = useCallback((timestamp: number) => {
    if (isGameOver || isPaused) return;

    if (timestamp - lastUpdateTimeRef.current > speed) {
      lastUpdateTimeRef.current = timestamp;

      if (directionQueueRef.current.length > 0) {
        const nextDir = directionQueueRef.current.shift();
        if(nextDir) setDirection(nextDir);
      }

      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        let head = { ...newSnake[0] };

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
          setScore(s => s + 1);
          applyPrank();
          const newFoods = foods.filter((_, index) => index !== foodIndex);
          if (newFoods.length === 0) {
            generateFoodBatch();
          } else {
            setFoods(newFoods);
          }
          if ((score + 1) % 5 === 0) {
            setSpeed(s => Math.max(MIN_SPEED_MS, s - SPEED_INCREMENT * 5));
          }
        } else {
          if (activePrank === 'GET_SLIM' && newSnake.length > 2) {
              newSnake.pop(); newSnake.pop();
          } else {
              newSnake.pop();
          }
        }
        return newSnake;
      });

      if (prankTimer > 0) {
        setPrankTimer(t => t - 1);
      } else {
        resetPranks();
      }
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isGameOver, isPaused, speed, direction, foods, score, activePrank, prankTimer, applyPrank, generateFoodBatch, resetPranks]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      lastUpdateTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [isPaused, isGameOver, gameLoop]);

  // --- Drawing ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#a9ddd3';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const isGhost = activePrank === 'GHOST_MODE';
    snake.forEach((segment, index) => {
      ctx.fillStyle = isGhost && index !== 0 ? 'rgba(1, 1, 1, 0.3)' : '#010101';
      const offset = (GRID_SIZE - snakeWidth) / 2;
      ctx.fillRect(segment.x * GRID_SIZE + offset, segment.y * GRID_SIZE + offset, snakeWidth, snakeWidth);

      if (index === 0) {
        ctx.fillStyle = '#e8e3d5';
        const eyeSize = GRID_SIZE / 5;
        switch (direction) {
          case 'UP':
            ctx.fillRect(segment.x * GRID_SIZE + eyeSize, segment.y * GRID_SIZE + eyeSize, eyeSize, eyeSize);
            ctx.fillRect(segment.x * GRID_SIZE + (GRID_SIZE - 2 * eyeSize), segment.y * GRID_SIZE + eyeSize, eyeSize, eyeSize);
            break;
          case 'DOWN':
            ctx.fillRect(segment.x * GRID_SIZE + eyeSize, segment.y * GRID_SIZE + (GRID_SIZE - 2 * eyeSize), eyeSize, eyeSize);
            ctx.fillRect(segment.x * GRID_SIZE + (GRID_SIZE - 2 * eyeSize), segment.y * GRID_SIZE + (GRID_SIZE - 2 * eyeSize), eyeSize, eyeSize);
            break;
          case 'LEFT':
            ctx.fillRect(segment.x * GRID_SIZE + eyeSize, segment.y * GRID_SIZE + eyeSize, eyeSize, eyeSize);
            ctx.fillRect(segment.x * GRID_SIZE + eyeSize, segment.y * GRID_SIZE + (GRID_SIZE - 2 * eyeSize), eyeSize, eyeSize);
            break;
          case 'RIGHT':
            ctx.fillRect(segment.x * GRID_SIZE + (GRID_SIZE - 2 * eyeSize), segment.y * GRID_SIZE + eyeSize, eyeSize, eyeSize);
            ctx.fillRect(segment.x * GRID_SIZE + (GRID_SIZE - 2 * eyeSize), segment.y * GRID_SIZE + (GRID_SIZE - 2 * eyeSize), eyeSize, eyeSize);
            break;
        }
      }
    });

    if (foodImageRef.current) {
      const foodSize = GRID_SIZE * 2;
      const foodOffset = (foodSize - GRID_SIZE) / 2;
      foods.forEach(food => {
        ctx.drawImage(foodImageRef.current!, (food.x * GRID_SIZE) - foodOffset, (food.y * GRID_SIZE) - foodOffset, foodSize, foodSize);
      });
    }
    
    if (isPaused && !isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

  }, [snake, foods, activePrank, snakeWidth, isPaused, isGameOver, direction]);

  // --- Keyboard Input ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentDirection = directionQueueRef.current.length > 0 ? directionQueueRef.current[directionQueueRef.current.length - 1] : direction;
      let newDirection: Direction | null = null;
      const up = isReversed ? 'DOWN' : 'UP';
      const down = isReversed ? 'UP' : 'DOWN';
      const left = isReversed ? 'RIGHT' : 'LEFT';
      const right = isReversed ? 'LEFT' : 'RIGHT';

      switch (e.key) {
        case 'ArrowUp': case 'w': if (currentDirection !== down) newDirection = up; break;
        case 'ArrowDown': case 's': if (currentDirection !== up) newDirection = down; break;
        case 'ArrowLeft': case 'a': if (currentDirection !== right) newDirection = left; break;
        case 'ArrowRight': case 'd': if (currentDirection !== left) newDirection = right; break;
      }
      queueDirectionChange(newDirection);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isReversed, queueDirectionChange]);

  // --- Asset Preloading ---
  useEffect(() => {
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => { foodImageRef.current = img; };
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-rialo-beige p-4 font-sans">
      <div className="text-center mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-rialo-dark">Snake Game – Rialo Edition</h1>
        <p className="text-rialo-dark/80 mt-1 text-sm md:text-base">Move the snake, eat the Rialo coins, and watch out for food pranks!</p>
      </div>

      <div className="w-full max-w-[600px] bg-rialo-dark text-white p-2 rounded-t-lg flex justify-between font-bold text-lg border-4 border-b-0 border-rialo-dark">
        <span>SCORE: {score}</span>
        {activePrank !== 'NONE' && <span className='animate-pulse'>PRANK: {activePrank}</span>}
      </div>

      <div className="w-full max-w-[608px] border-4 border-t-0 border-rialo-dark rounded-b-lg shadow-lg aspect-square">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-rialo-mint rounded-b-md block w-full h-full"
          onClick={() => isPaused && !isGameOver && setIsPaused(false)}
        >
          Your browser does not support the canvas.
        </canvas>
      </div>
      
      <div className="text-center mt-4 text-rialo-dark/70">
        {!isMobile && <p>Use Arrow Keys / WASD to move.</p>}
        <Link to="/" className="text-rialo-dark underline mt-2 inline-block hover:text-rialo-dark/80">Back to Home</Link>
      </div>

      {isMobile && (
        <div className="mt-4 grid grid-cols-3 grid-rows-2 gap-2 w-48">
          <div className="col-start-2 row-start-1 flex justify-center items-center">
            <button onTouchStart={(e) => {e.preventDefault(); queueDirectionChange('UP')}} onMouseDown={(e) => e.preventDefault()} onClick={(e) => {e.preventDefault()}} className="w-16 h-16 bg-rialo-dark/80 text-white font-bold rounded-lg text-2xl active:bg-rialo-dark">▲</button>
          </div>
          <div className="col-start-1 row-start-2 flex justify-center items-center">
            <button onTouchStart={(e) => {e.preventDefault(); queueDirectionChange('LEFT')}} onMouseDown={(e) => e.preventDefault()} onClick={(e) => {e.preventDefault()}} className="w-16 h-16 bg-rialo-dark/80 text-white font-bold rounded-lg text-2xl active:bg-rialo-dark">◀</button>
          </div>
          <div className="col-start-3 row-start-2 flex justify-center items-center">
            <button onTouchStart={(e) => {e.preventDefault(); queueDirectionChange('RIGHT')}} onMouseDown={(e) => e.preventDefault()} onClick={(e) => {e.preventDefault()}} className="w-16 h-16 bg-rialo-dark/80 text-white font-bold rounded-lg text-2xl active:bg-rialo-dark">▶</button>
          </div>
          <div className="col-start-2 row-start-2 flex justify-center items-center">
            <button onTouchStart={(e) => {e.preventDefault(); queueDirectionChange('DOWN')}} onMouseDown={(e) => e.preventDefault()} onClick={(e) => {e.preventDefault()}} className="w-16 h-16 bg-rialo-dark/80 text-white font-bold rounded-lg text-2xl active:bg-rialo-dark">▼</button>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center transition-opacity duration-300 z-50">
          <div className="bg-white p-8 rounded-lg text-center shadow-xl max-w-sm mx-4">
            <h2 className="text-3xl font-bold mb-2 text-rialo-dark">Game Over!</h2>
            <p className="text-xl mb-6 text-rialo-dark/80">Final Score: {score}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={resetGame} className="px-6 py-2 bg-rialo-mint font-semibold rounded-lg hover:bg-opacity-80 transition-colors">Restart</button>
              <Link to="/" className="px-6 py-2 bg-gray-300 font-semibold rounded-lg hover:bg-gray-400 transition-colors">Back to Home</Link>
            </div>
          </div>
        </div> 
      )}
    </div>
  );
};

export default SnakePage;
