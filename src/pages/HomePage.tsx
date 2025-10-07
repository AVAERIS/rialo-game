import NebulaBackground from '../components/NebulaBackground';

import { useTransition } from '../context/TransitionContext';


type Game = {
  emoji: string;
  title: string;
  description: string;
  href: string;
  status: 'active' | 'coming-soon';
  bgColor: string;
};

type GameCardProps = {
  game: Game;
  index: number;
};


const games: Game[] = [
  {
    emoji: '🐍',
    title: 'Snake Game',
    description: 'The classic arcade game with a chaotic twist.',
    href: '/snake',
    status: 'active',
    bgColor: 'bg-rialo-mint/70',
  },
  {
    emoji: '🎨',
    title: 'Color Trap',
    description: 'Follow the instructions... if you can.',
    href: '/color-trap',
    status: 'active',
    bgColor: 'bg-blue-400/70',
  },
  {
    emoji: '🏀',
    title: 'Rialo Bounce',
    description: 'Bounce the Rialo logo on the neon pads. How far can you jump?',
    href: '/rialo-bounce',
    status: 'active',
    bgColor: 'bg-purple-400/70',
  },
  {
    emoji: '💥',
    title: 'Minesweeper',
    description: "Don't blow up. A classic logic puzzle.",
    href: '#',
    status: 'coming-soon',
    bgColor: 'bg-gray-400/70',
  },
  {
    emoji: '🧩',
    title: 'Sliding Puzzle',
    description: 'Slide the tiles to solve the puzzle.',
    href: '#',
    status: 'coming-soon',
    bgColor: 'bg-gray-400/70',
  },
];


const GameCard = ({ game, index }: GameCardProps) => {
  const { startTransition } = useTransition();
  const isComingSoon = game.status === 'coming-soon';

  const handleCardClick = () => {
    if (isComingSoon) return;
    startTransition(game.href);
  };

  const cardContent = (
    <div
      className={`relative w-full h-full text-center no-underline transition-all duration-300 ease-in-out transform-gpu rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-105 border border-rialo-dark/10 ${isComingSoon ? 'grayscale opacity-70 cursor-not-allowed' : ''}`}
      style={{ animationDelay: `${index * 100 + 300}ms` }}
    >
      {isComingSoon && (
        <div className="absolute top-2 right-2 bg-rialo-dark text-rialo-beige text-xs font-bold px-3 py-1 rounded-full z-10">
          COMING SOON
        </div>
      )}
      <div className={`flex items-center justify-center h-24 sm:h-28 bg-blue-400/70 rounded-t-2xl`}>
        <p className="text-4xl sm:text-5xl transition-transform duration-300 group-hover:scale-110">{game.emoji}</p>
      </div>
      <div className="py-2 px-2 bg-white/50 backdrop-blur-sm rounded-b-2xl">
        <h3 className="font-semibold text-lg sm:text-xl text-rialo-dark">{game.title}</h3>
      </div>
    </div>
  );

  return (
    <div
      className="group animate-fade-in-up transition-transform duration-100 active:scale-95 cursor-pointer"
      onClick={handleCardClick}
    >
      {cardContent}
    </div>
  );
};


const HomePage = () => {

  return (
    <div className="bg-rialo-beige w-full min-h-screen flex flex-col">
      <NebulaBackground />

      
      <header className="relative z-10 text-center pt-8 pb-4 px-4">
        <div className="absolute top-4 right-4 z-20">
          <img src="/logo.png" alt="Rialo Logo" className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 [filter:drop-shadow(0_0_12px_white)]" />
        </div>
        <h1 className="font-orbitron text-4xl sm:text-6xl lg:text-8xl font-extrabold text-rialo-dark [text-shadow:-1px_-1px_0_rgba(255,255,255,0.9),_1px_-1px_0_rgba(255,255,255,0.9),_-1px_1px_0_rgba(255,255,255,0.9),_1px_1px_0_rgba(255,255,255,0.9)]">
          Rialo Arcade
        </h1>
      </header>

      
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
          {games.map((game, index) => (
            <GameCard key={game.title} game={game} index={index} />
          ))}
        </div>
      </main>

      
      <footer className="relative z-10 w-full text-center py-3">
        <p className="font-orbitron text-sm text-white [text-shadow:-1px_-1px_0_rgba(0,0,0,0.7),_1px_-1px_0_rgba(0,0,0,0.7),_-1px_1px_0_rgba(0,0,0,0.7),_1px_1px_0_rgba(0,0,0,0.7)]">© 2025 Rialo Games | Developed by Avery Acee</p>
      </footer>
    </div>
  );
};

export default HomePage;