import React, { useRef, useEffect, useCallback } from 'react';
import rlogo from '../assets/logo.png';


type Ball = { x: number; y: number; vx: number; vy: number; radius: number; trail: {x: number, y: number}[] };
type Paddle = { x: number; width: number; height: number; };
type Brick = { x: number; y: number; health: number; color: string; };
type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; };
type PowerUp = { x: number; y: number; type: 'newBall'; size: number; status: number; };
export type GameState = 'waiting' | 'playing' | 'gameOver' | 'win';



const colors = {
  background: ['#1a2a6c', '#b21f1f', '#fdbb2d'],
  paddle: '#b21f1f',
  ball: '#ffffff',
  brick: ['#fdbb2d', '#b21f1f', '#1a2a6c'],
  particle: '#ffffff',
  powerUp: {
    newBall: '#fdbb2d',
  },
  frame: '#DAB452',
};


const brickRowCount = 10;
const brickColumnCount = 12;
const brickPatterns = [
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let r = 0; r < brickRowCount / 2; r++) {
      for (let c = r; c < brickColumnCount - r; c++) {
        pattern[c][r] = 1;
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    const midRow = Math.floor(brickRowCount / 2);
    for (let r = 0; r < midRow; r++) {
      for (let c = midRow - 1 - r; c < midRow + r; c++) {
        pattern[c][r] = 1;
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if ((c + r) % 2 === 0) {
          pattern[c][r] = 1;
        } else if (Math.random() < 0.3) { 
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(1));
    for (let c = 5; c < brickColumnCount - 5; c++) {
      for (let r = 4; r < brickRowCount - 4; r++) {
        if (Math.random() > 0.4) { 
          pattern[c][r] = 0;
        }
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (c % 2 === 0) {
          pattern[c][r] = 1;
        } else if (Math.random() < 0.3) {
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (r % 2 === 0) {
          pattern[c][r] = 1;
        } else if (Math.random() < 0.3) {
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (c === 0 || c === brickColumnCount - 1 || r === 0 || r === brickRowCount - 1) {
          pattern[c][r] = 1; 
        } else if (Math.random() < 0.35) {
          pattern[c][r] = 1; 
        }
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (Math.random() > 0.25) pattern[c][r] = 1; 
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    
    pattern[3][3] = 1; pattern[8][3] = 1;
    
    pattern[2][5] = 1;
    pattern[3][6] = 1;
    pattern[4][6] = 1;
    pattern[5][6] = 1;
    pattern[6][6] = 1;
    pattern[7][6] = 1;
    pattern[8][6] = 1;
    pattern[9][5] = 1;

    
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (pattern[c][r] === 0 && Math.random() < 0.25) { 
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    const midC = Math.floor(brickColumnCount / 2);
    const midR = Math.floor(brickRowCount / 2);
    for (let r = 0; r < midR; r++) {
      for (let c = midC - r; c <= midC + r; c++) {
        if (c >= 0 && c < brickColumnCount) pattern[c][r] = 1;
      }
    }
    for (let r = midR; r < brickRowCount; r++) {
      for (let c = midC - (brickRowCount - r - 1); c <= midC + (brickRowCount - r - 1); c++) {
        if (c >= 0 && c < brickColumnCount) pattern[c][r] = 1;
      }
    }
    return pattern;
  },
  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let i = 0; i < brickColumnCount + brickRowCount; i+=2) {
      for (let c = 0; c < brickColumnCount; c++) {
        const r = i - c;
        if (r >= 0 && r < brickRowCount) {
          pattern[c][r] = 1;
          if(r+1 < brickRowCount) pattern[c][r+1] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let i = 0; i < brickColumnCount + brickRowCount; i+=2) {
      for (let c = 0; c < brickColumnCount; c++) {
        const r = i - (brickColumnCount - 1 - c);
        if (r >= 0 && r < brickRowCount) {
          pattern[c][r] = 1;
          if(r+1 < brickRowCount) pattern[c][r+1] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    const midC = Math.floor(brickColumnCount / 2);
    const midR = Math.floor(brickRowCount / 2);
    for (let c = 0; c < brickColumnCount; c++) {
      pattern[c][midR] = 1;
      pattern[c][midR+1] = 1;
    }
    for (let r = 0; r < brickRowCount; r++) {
      pattern[midC][r] = 1;
      pattern[midC+1][r] = 1;
    }
    
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (pattern[c][r] === 0 && Math.random() < 0.25) {
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let i = 0; i < Math.min(brickColumnCount, brickRowCount); i++) {
      pattern[i][i] = 1;
      if(i+1 < brickColumnCount && i+1 < brickRowCount) pattern[i+1][i+1] = 1;
      pattern[brickColumnCount - 1 - i][i] = 1;
      if(brickColumnCount - 2 - i >= 0 && i+1 < brickRowCount) pattern[brickColumnCount - 2 - i][i+1] = 1;
    }
    
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (pattern[c][r] === 0 && Math.random() < 0.25) {
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    const midC = Math.floor(brickColumnCount / 2);
    for(let r=2; r<9; r++) {
        for(let c=midC-4; c<=midC+4; c++) {
            if ((Math.pow(c-midC+2, 2) + Math.pow(r-4, 2) < 8) || (Math.pow(c-midC-2, 2) + Math.pow(r-4, 2) < 8) || (Math.pow(c-midC, 2) + Math.pow(r-7, 2) < 25 && r > 4)) {
                pattern[c][r] = 1;
            }
        }
    }
    
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (pattern[c][r] === 0 && Math.random() < 0.25) {
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    const midC = Math.floor(brickColumnCount / 2), midR = 7;
    for(let r=0; r<brickRowCount; r++) {
        for(let c=0; c<brickColumnCount; c++) {
            if(Math.abs(c-midC) + Math.abs(r-midR) < 5) pattern[c][r] = 1;
        }
    }
    pattern[midC][midR-4] = 1;
    pattern[midC-1][midR-2] = 1; pattern[midC+1][midR-2] = 1;
    for(let c=midC-3; c<=midC+3; c++) pattern[c][midR-1] = 1;
    pattern[midC-2][midR] = 1; pattern[midC][midR] = 1; pattern[midC+2][midR] = 1;
    pattern[midC-1][midR+1] = 1; pattern[midC+1][midR+1] = 1;
    pattern[midC-2][midR+2] = 1; pattern[midC+2][midR+2] = 1;
    
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (pattern[c][r] === 0 && Math.random() < 0.25) {
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    const midC = Math.floor(brickColumnCount / 2);
    for(let r=2; r<10; r++) { pattern[midC][r] = 1; pattern[midC-1][r] = 1; }
    pattern[midC-1][3] = 1; pattern[midC+1][3] = 1;
    pattern[midC-2][4] = 1; pattern[midC+2][4] = 1;
    pattern[midC-3][5] = 1; pattern[midC+3][5] = 1;
    
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (pattern[c][r] === 0 && Math.random() < 0.25) {
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    return Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(1));
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(1));
    for (let c = 7; c < brickColumnCount - 7; c++) {
      for (let r = 5; r < brickRowCount - 5; r++) {
        if (Math.random() > 0.4) { 
          pattern[c][r] = 0;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (c % 2 === (r % 2)) { 
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let c = 0; c < brickColumnCount; c++) {
      const r = Math.floor(Math.sin(c / 2) * 3 + brickRowCount / 2);
      pattern[c][r] = 1;
      pattern[c][r+1] = 1;
    }
    
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (pattern[c][r] === 0 && Math.random() < 0.15) {
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (Math.random() > 0.3) pattern[c][r] = 1;
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    const midC = brickColumnCount / 2;
    const midR = brickRowCount / 2;
    for (let r = 0; r < brickRowCount; r++) {
      for (let c = 0; c < brickColumnCount; c++) {
        const dist = Math.sqrt(Math.pow(c - midC, 2) + Math.pow(r - midR, 2));
        if (Math.floor(dist) % 2 === 0) { 
          pattern[c][r] = 1;
        }
      }
    }
    return pattern;
  },

  
  () => {
    const pattern = Array.from({ length: brickColumnCount }, () => Array(brickRowCount).fill(0));
    let top = 0, bottom = brickRowCount - 1, left = 0, right = brickColumnCount - 1;
    let dir = 0;
    while (top <= bottom && left <= right) {
      if (dir === 0) {
        for (let i = left; i <= right; i++) { pattern[i][top] = 1; if(top+1 <= bottom) pattern[i][top+1] = 1; }
        top+=2;
      } else if (dir === 1) {
        for (let i = top; i <= bottom; i++) { pattern[right][i] = 1; if(right-1 >= left) pattern[right-1][i] = 1; }
        right-=2;
      } else if (dir === 2) {
        for (let i = right; i >= left; i--) { pattern[i][bottom] = 1; if(bottom-1 >= top) pattern[i][bottom-1] = 1; }
        bottom-=2;
      } else if (dir === 3) {
        for (let i = bottom; i >= top; i--) { pattern[left][i] = 1; if(left+1 <= right) pattern[left+1][i] = 1; }
        left+=2;
      }
      dir = (dir + 1) % 4;
    }
    return pattern;
  },
];

interface RialoBounceCanvasProps {
  setScore: React.Dispatch<React.SetStateAction<number>>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const RialoBounceCanvas: React.FC<RialoBounceCanvasProps> = ({
  setScore,
  gameState,
  setGameState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const brickCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const brickCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const brickHeightRef = useRef(20);
  const brickPaddingRef = useRef(10);
  const brickOffsetTopRef = useRef(30);
  const ballRadiusRef = useRef(10);
  const paddleWidthRef = useRef(100);
  const paddleHeightRef = useRef(20);
  const initialSpeedRef = useRef(4);

  const scoreRef = useRef(0);
  const bricksRemainingRef = useRef(0);
  const ballsRef = useRef<Ball[]>([]);
  const paddleRef = useRef<Paddle | null>(null);
  const bricksRef = useRef<Brick[][]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const targetPaddleXRef = useRef(0);
  const gameStateRef = useRef<GameState>(gameState);
  const lastTimeRef = useRef(0);
  const speedRef = useRef(5);
  const frameWidth = 5;
  const framePathRef = useRef<Path2D | null>(null);
  

  const brickWidthRef = useRef(0);
  const brickOffsetLeftRef = useRef(0);
  const gameOverAnimationRef = useRef(0);

  useEffect(() => {
    const img = new Image();
    img.src = rlogo;
    img.onload = () => {
      logoImageRef.current = img;
    };
    brickCanvasRef.current = document.createElement('canvas');
    brickCtxRef.current = brickCanvasRef.current.getContext('2d');
    bgCanvasRef.current = document.createElement('canvas');
    bgCtxRef.current = bgCanvasRef.current.getContext('2d');
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
    if(gameState === 'gameOver') {
      gameOverAnimationRef.current = 0;
    }
  }, [gameState]);

  const initializeBricks = useCallback(() => {
    const bricks: Brick[][] = [];
    const patternGenerator = brickPatterns[Math.floor(Math.random() * brickPatterns.length)];
    const pattern = patternGenerator();

    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        if (pattern[c][r] === 1) {
          const color = colors.brick[r % colors.brick.length];
          let health = 1;
          if (Math.random() < 0.2) health = 2;
          bricks[c][r] = { x: 0, y: 0, health, color };
        } else {
          bricks[c][r] = { x: 0, y: 0, health: 0, color: '' };
        }
      }
    }
    bricksRef.current = bricks;
    bricksRemainingRef.current = bricks.flat().filter(b => b.health > 0).length;
  }, []);

  const triggerParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        life: 60,
      });
    }
  };

  const spawnPowerUp = (x: number, y: number) => {
    if (Math.random() < 0.1) {
      powerUpsRef.current.push({ x, y, type: 'newBall', size: 15, status: 1 });
    }
  };

  const createFramePath = (ctx: CanvasRenderingContext2D): Path2D => {
    const x = frameWidth / 2;
    const y = frameWidth / 2;
    const w = ctx.canvas.width - frameWidth;
    const h = ctx.canvas.height - frameWidth;
    const r = 15;
    const path = new Path2D();
    path.moveTo(x + r, y);
    path.lineTo(x + w - r, y);
    path.arcTo(x + w, y, x + w, y + r, r);
    path.lineTo(x + w, y + h - r);
    path.arcTo(x + w, y + h, x + w - r, y + h, r);
    path.lineTo(x + r, y + h);
    path.arcTo(x, y + h, x, y + h - r, r);
    path.lineTo(x, y + r);
    path.arcTo(x, y, x + r, y, r);
    path.closePath();
    return path;
  };

  const drawBall = (ctx: CanvasRenderingContext2D, ball: Ball, logoImage: HTMLImageElement) => {
    
    ball.trail.forEach((p, i) => {
      const opacity = (i + 1) / ball.trail.length;
      ctx.beginPath();
      ctx.arc(p.x, p.y, ball.radius * opacity, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
      ctx.fill();
    });

    const { x, y, radius } = ball;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.ball;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logoImage, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
  };

  const drawPaddle = (ctx: CanvasRenderingContext2D, paddle: Paddle) => {
    const x = paddle.x;
    const y = ctx.canvas.height - paddle.height;
    const w = paddle.width;
    const h = paddle.height;
    const r = h / 2;

    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, '#666666');
    gradient.addColorStop(0.5, '#999999');
    gradient.addColorStop(1, '#666666');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  };

  const preRenderBricks = () => {
    const ctx = brickCtxRef.current;
    const canvas = brickCanvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const brickWidth = brickWidthRef.current;
    const brickOffsetLeft = brickOffsetLeftRef.current;

    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const brick = bricksRef.current[c][r];
        if (brick.health > 0) {
          const brickX = c * (brickWidth + brickPaddingRef.current) + brickOffsetLeft;
          const brickY = r * (brickHeightRef.current + brickPaddingRef.current) + brickOffsetTopRef.current;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(brickX, brickY, brickWidth, brickHeightRef.current, 5);
          ctx.closePath();
          ctx.globalAlpha = brick.health > 1 ? 1.0 : 0.7;
          ctx.fillStyle = brick.color;
          ctx.fill();

          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(brickX + 2, brickY + 2, brickWidth - 4, brickHeightRef.current - 4);

          const gradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeightRef.current);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.restore();
        }
      }
    }
  };

  const updateSingleBrickOnCache = (brick: Brick, c: number, r: number) => {
    const ctx = brickCtxRef.current;
    if (!ctx) return;
    const brickWidth = brickWidthRef.current;
    const brickOffsetLeft = brickOffsetLeftRef.current;
    const brickX = c * (brickWidth + brickPaddingRef.current) + brickOffsetLeft;
    const brickY = r * (brickHeightRef.current + brickPaddingRef.current) + brickOffsetTopRef.current;
    ctx.clearRect(brickX - 2, brickY - 2, brickWidth + 4, brickHeightRef.current + 4);
    if (brick.health > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(brickX, brickY, brickWidth, brickHeightRef.current, 5);
      ctx.closePath();
      ctx.globalAlpha = brick.health > 1 ? 1.0 : 0.7;
      ctx.fillStyle = brick.color;
      ctx.fill();

      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(brickX + 2, brickY + 2, brickWidth - 4, brickHeightRef.current - 4);

      const gradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeightRef.current);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    }
  };

  const drawBricks = (ctx: CanvasRenderingContext2D) => {
    if (brickCanvasRef.current) {
      ctx.drawImage(brickCanvasRef.current, 0, 0);
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life / 60;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  const drawPowerUps = (ctx: CanvasRenderingContext2D) => {
    powerUpsRef.current.forEach(p => {
      if (p.status === 1) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.powerUp.newBall;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('B', p.x, p.y);
        ctx.restore();
      }
    });
  };

  const preRenderBackground = () => {
    const ctx = bgCtxRef.current;
    const canvas = bgCanvasRef.current;
    if (!ctx || !canvas || !framePathRef.current) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, colors.background[0]);
    bg.addColorStop(0.5, colors.background[1]);
    bg.addColorStop(1, colors.background[2]);
    ctx.fillStyle = bg;
    ctx.save();
    ctx.clip(framePathRef.current);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = frameWidth;
    ctx.stroke(framePathRef.current);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = colors.frame;
    ctx.lineWidth = 2;
    ctx.stroke(framePathRef.current);
    ctx.restore();
  };

  const drawStartScreen = (ctx: CanvasRenderingContext2D) => {
    const usableHeight = ctx.canvas.height - frameWidth * 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '24px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click or Press Space to Start', ctx.canvas.width / 2, frameWidth + usableHeight / 2);
  };

  const drawGameOver = (ctx: CanvasRenderingContext2D) => {
    const progress = Math.min(gameOverAnimationRef.current / 60, 1);
    const usableHeight = ctx.canvas.height - frameWidth * 2;
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * progress})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.globalAlpha = progress;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', ctx.canvas.width / 2, frameWidth + usableHeight / 2 - 60);
    ctx.font = '32px Poppins, sans-serif';
    ctx.fillText(`Final Score: ${scoreRef.current}`, ctx.canvas.width / 2, frameWidth + usableHeight / 2);
    ctx.font = '20px Poppins, sans-serif';
    ctx.fillText('Click to Restart', ctx.canvas.width / 2, frameWidth + usableHeight / 2 + 50);
    ctx.restore();
  };

  const drawWinScreen = (ctx: CanvasRenderingContext2D) => {
    const progress = Math.min(gameOverAnimationRef.current / 60, 1);
    const usableHeight = ctx.canvas.height - frameWidth * 2;
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * progress})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.globalAlpha = progress;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pattern Cleared!', ctx.canvas.width / 2, frameWidth + usableHeight / 2 - 60);
    ctx.font = '20px Poppins, sans-serif';
    ctx.fillText('Click to Play Again', ctx.canvas.width / 2, frameWidth + usableHeight / 2 + 50);
    ctx.restore();
  };



  const resetBallsAndPaddle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ballsRef.current = [{
      x: canvas.width / 2,
      y: canvas.height - 50,
      vx: initialSpeedRef.current,
      vy: -initialSpeedRef.current,
      radius: ballRadiusRef.current,
      trail: [],
    }];
    paddleRef.current = {
      x: (canvas.width - paddleWidthRef.current) / 2,
      width: paddleWidthRef.current,
      height: paddleHeightRef.current,
    };
    targetPaddleXRef.current = paddleRef.current.x;
  }, []);

  const resetGame = useCallback((newGame = true) => {
    if (newGame) {
      setScore(0);
      scoreRef.current = 0;
    }
    speedRef.current = 5;
    initializeBricks();
    particlesRef.current = [];
    powerUpsRef.current = [];
    resetBallsAndPaddle();
    preRenderBricks();
    setGameState('playing');
  }, [setScore, setGameState, initializeBricks, resetBallsAndPaddle]);

  const update = (delta: number) => {
    if (gameStateRef.current === 'gameOver' || gameStateRef.current === 'win') {
      gameOverAnimationRef.current += delta;
      return;
    }
    if (gameStateRef.current !== 'playing') return;

    const paddle = paddleRef.current!;
    const canvas = canvasRef.current!;

    paddle.x += (targetPaddleXRef.current - paddle.x) * 0.3;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.vy += 0.1;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }

    powerUpsRef.current.forEach(p => {
      if (p.status === 1) {
        p.y += 2 * delta;
        if (p.y > canvas.height) {
          p.status = 0;
        }
        if (
          p.y + p.size > canvas.height - paddle.height &&
          p.x + p.size > paddle.x &&
          p.x - p.size < paddle.x + paddle.width
        ) {
          p.status = 0;
          if (p.type === 'newBall') {
            const newBall: Ball = {
              x: paddle.x + paddle.width / 2,
              y: canvas.height - paddle.height - 20,
              vx: (Math.random() - 0.5) * 8,
              vy: -5,
              radius: ballRadiusRef.current,
              trail: [],
            };
            ballsRef.current.push(newBall);
          }
        }
      }
    });

    ballsRef.current.forEach((ball, index) => {
      updateBall(ball, index, delta);
    });
  };

  const updateBall = (ball: Ball, index: number, delta: number) => {
    const paddle = paddleRef.current!;
    const canvas = canvasRef.current!;
    const brickWidth = brickWidthRef.current;
    const brickOffsetLeft = brickOffsetLeftRef.current;

    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 10) {
      ball.trail.shift();
    }

    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;

    
    if (ball.x + ball.radius > canvas.width - frameWidth) {
      ball.x = canvas.width - ball.radius - frameWidth;
      ball.vx = -Math.abs(ball.vx);
    }
    if (ball.x - ball.radius < frameWidth) {
      ball.x = ball.radius + frameWidth;
      ball.vx = Math.abs(ball.vx);
    }
    if (ball.y - ball.radius < frameWidth) {
      ball.y = ball.radius + frameWidth;
      ball.vy = Math.abs(ball.vy);
    }

    
    const hitPaddle =
      ball.y + ball.radius >= canvas.height - paddle.height &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width;

    if (hitPaddle) {
      const collidePoint = ball.x - (paddle.x + paddle.width / 2);
      const normalized = collidePoint / (paddle.width / 2);
      const maxBounceAngle = Math.PI / 3;
      const bounceAngle = normalized * maxBounceAngle;
      speedRef.current = Math.min(speedRef.current * (1 + 0.02), 10);
      ball.vx = speedRef.current * Math.sin(bounceAngle);
      ball.vy = -Math.abs(speedRef.current * Math.cos(bounceAngle));
      const minVX = 2;
      if (Math.abs(ball.vx) < minVX) {
        ball.vx = minVX * (ball.vx < 0 ? -1 : 1);
      }
    }

    
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;

    const startCol = Math.max(0, Math.floor((ballLeft - brickOffsetLeft) / (brickWidth + brickPaddingRef.current)));
    const endCol = Math.min(brickColumnCount - 1, Math.ceil((ballRight - brickOffsetLeft) / (brickWidth + brickPaddingRef.current)));
    const startRow = Math.max(0, Math.floor((ballTop - brickOffsetTopRef.current) / (brickHeightRef.current + brickPaddingRef.current)));
    const endRow = Math.min(brickRowCount - 1, Math.ceil((ballBottom - brickOffsetTopRef.current) / (brickHeightRef.current + brickPaddingRef.current)));

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const b = bricksRef.current[c][r];
        if (b.health > 0) {
          const brickX = c * (brickWidth + brickPaddingRef.current) + brickOffsetLeft;
          const brickY = r * (brickHeightRef.current + brickPaddingRef.current) + brickOffsetTopRef.current;
          b.x = brickX;
          b.y = brickY;

          if (
            ball.x + ball.radius > b.x &&
            ball.x - ball.radius < b.x + brickWidth &&
            ball.y + ball.radius > b.y &&
            ball.y - ball.radius < b.y + brickHeightRef.current
          ) {
            const prevBallX = ball.x - ball.vx * delta;
            const prevBallY = ball.y - ball.vy * delta;

            if (prevBallY + ball.radius <= b.y || prevBallY - ball.radius >= b.y + brickHeightRef.current) {
              ball.vy = -ball.vy;
              if (ball.y < b.y) ball.y = b.y - ball.radius;
              else ball.y = b.y + brickHeightRef.current + ball.radius;
            } else if (prevBallX + ball.radius <= b.x || prevBallX - ball.radius >= b.x + brickWidth) {
              ball.vx = -ball.vx;
              if (ball.x < b.x) ball.x = b.x - ball.radius;
              else ball.x = b.x + brickWidth + ball.radius;
            } else {
              ball.vy = -ball.vy;
            }

            b.health -= 1;
            updateSingleBrickOnCache(b, c, r);
            triggerParticles(ball.x, ball.y, b.color);

            if (b.health === 0) {
              spawnPowerUp(b.x, b.y);
              scoreRef.current += 10;
              setScore(scoreRef.current);
              bricksRemainingRef.current -= 1;
              if (bricksRemainingRef.current === 0) {
                setGameState('win');
              }
            }
          }
        }
      }
    }

    if (ball.y + ball.radius > canvas.height) {
      if (ballsRef.current.length === 1) {
        setGameState('gameOver');
      } else {
        ballsRef.current.splice(index, 1);
      }
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const logo = logoImageRef.current;
    if (!ctx || !canvas || !logo || !framePathRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgCanvasRef.current) {
      ctx.drawImage(bgCanvasRef.current, 0, 0);
    }

    ctx.save();
    ctx.clip(framePathRef.current);
    const paddle = paddleRef.current!;
    if (gameStateRef.current === 'playing') {
      drawBricks(ctx);
      drawParticles(ctx);
      drawPowerUps(ctx);
      ballsRef.current.forEach(ball => {
        drawBall(ctx, ball, logo);
      });
      drawPaddle(ctx, paddle);
    } else if (gameStateRef.current === 'waiting') {
      drawStartScreen(ctx);
    } else if (gameStateRef.current === 'gameOver') {
      drawGameOver(ctx);
    } else if (gameStateRef.current === 'win') {
      drawWinScreen(ctx);
    }
    ctx.restore();
  };

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    if (brickCanvasRef.current) {
      brickCanvasRef.current.width = canvas.width;
      brickCanvasRef.current.height = canvas.height;
    }
    if (bgCanvasRef.current) {
      bgCanvasRef.current.width = canvas.width;
      bgCanvasRef.current.height = canvas.height;
    }

    
    ballRadiusRef.current = canvas.width / 45;
    paddleWidthRef.current = canvas.width / 7;
    paddleHeightRef.current = canvas.height / 35;
    initialSpeedRef.current = canvas.width / 130;

    const brickAreaHeight = canvas.height * 0.5;
    brickPaddingRef.current = canvas.width / 100;
    brickOffsetTopRef.current = canvas.height / 25;
    
    const usableWidth = canvas.width - frameWidth * 2;
    brickWidthRef.current = (usableWidth - (brickColumnCount - 1) * brickPaddingRef.current) / brickColumnCount;
    brickHeightRef.current = (brickAreaHeight - (brickRowCount - 1) * brickPaddingRef.current) / brickRowCount;
    
    brickOffsetLeftRef.current = (canvas.width - (brickColumnCount * brickWidthRef.current + (brickColumnCount - 1) * brickPaddingRef.current)) / 2;

    framePathRef.current = createFramePath(canvas.getContext('2d')!);
    initializeBricks();
    preRenderBackground();
    preRenderBricks();
    draw();
  }, [initializeBricks]);

  useEffect(() => {
    resizeCanvas();
  }, [gameState, resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleUserAction = () => {
      if (gameStateRef.current === 'waiting') {
        resetGame(true);
      } else if (gameStateRef.current === 'gameOver' || gameStateRef.current === 'win') {
        setGameState('waiting'); 
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (paddleRef.current && canvas) {
        const rect = canvas.getBoundingClientRect();
        let newX = e.clientX - rect.left - paddleRef.current.width / 2;
        const usableWidth = canvas.width - frameWidth * 2;
        newX = Math.max(frameWidth, newX);
        newX = Math.min(usableWidth - paddleRef.current.width + frameWidth, newX);
        targetPaddleXRef.current = newX;
        mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); 
      if (paddleRef.current && canvas && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        let newX = e.touches[0].clientX - rect.left - paddleRef.current.width / 2;
        const usableWidth = canvas.width - frameWidth * 2;
        newX = Math.max(frameWidth, newX);
        newX = Math.min(usableWidth - paddleRef.current.width + frameWidth, newX);
        targetPaddleXRef.current = newX;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      
      if (gameStateRef.current === 'waiting' || gameStateRef.current === 'gameOver' || gameStateRef.current === 'win') {
        handleUserAction();
      }
      e.preventDefault(); 
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleUserAction();
      }
    };

    let frameId: number;
    const loop = (time: number) => {
      const delta = Math.min((time - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = time;
      update(delta);
      draw();
      frameId = requestAnimationFrame(loop);
    };

    resizeCanvas();
    frameId = requestAnimationFrame(loop);

    
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('click', handleUserAction);
    document.addEventListener('keydown', keyHandler);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleUserAction);
      document.removeEventListener('keydown', keyHandler);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [resetGame, resizeCanvas]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
      }}
    />
  );
};

export default RialoBounceCanvas;