import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

// --- TYPES ---
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

// --- CONFIGURATION ---
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
    title: 'Rialo Color Trap',
    description: 'Follow the instructions... if you can.',
    href: '/color-trap',
    status: 'active',
    bgColor: 'bg-blue-400/70',
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

// --- HELPER COMPONENTS ---
const GameCard = ({ game, index }: GameCardProps) => {
  const isComingSoon = game.status === 'coming-soon';

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
      <div className={`flex items-center justify-center h-48 ${game.bgColor} rounded-t-2xl`}>
        <p className="text-6xl transition-transform duration-300 group-hover:scale-110">{game.emoji}</p>
      </div>
      <div className="py-5 px-4 bg-white/50 backdrop-blur-sm rounded-b-2xl">
        <h3 className="font-semibold text-2xl text-rialo-dark">{game.title}</h3>
        <p className="text-sm text-rialo-dark/70 mt-2 h-10">{game.description}</p>
      </div>
    </div>
  );

  if (isComingSoon) {
    return <div className="animate-fade-in-up">{cardContent}</div>;
  }

  return (
    <Link to={game.href} className="group animate-fade-in-up">
      {cardContent}
    </Link>
  );
};


const HomePage = () => {
  return (
    <div className="bg-rialo-beige w-full min-h-screen overflow-y-auto flex flex-col">
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col items-center flex-grow justify-start px-4 pt-20 md:pt-28 pb-20">
        
        <header className="absolute top-4 right-4 z-20 animate-fade-in">
          <img src="/logo.png" alt="Rialo Logo" className="w-24 h-24 md:w-28 md:h-28" />
        </header>

        <header className="text-center mb-16">
          <h1 
            className="text-5xl md:text-7xl font-extrabold text-rialo-dark animate-fade-in-up"
          >
            Rialo Arcade
          </h1>
          <p 
            className="mt-4 text-lg md:text-xl text-rialo-dark/70 animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            A curated collection of deceptively simple games.
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 w-full max-w-6xl">
          {games.map((game, index) => (
            <GameCard key={game.title} game={game} index={index} />
          ))}
        </main>
      </div>

      <footer className="relative z-10 w-full text-center py-6">
        <p className="text-sm text-rialo-dark/60">© 2025 Rialo Games | Developed by Avery Acee</p>
      </footer>
    </div>
  );
};

export default HomePage;
