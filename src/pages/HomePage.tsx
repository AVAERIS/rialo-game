import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import RialoLogo from '/logo.png';

const HomePage = () => {
  return (
    <div className="bg-rialo-beige w-full min-h-screen overflow-hidden flex flex-col">
      <ParticleBackground />
      
      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center flex-grow justify-start px-4 pt-24 md:pt-32 pb-20">
        
        <header className="absolute top-4 right-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <img src={RialoLogo} alt="Rialo Logo" className="w-24 h-24 md:w-32 md:h-32" />
        </header>

        {/* Title Block */}
        <div className="text-center">
          <h1 
            className="text-4xl md:text-6xl font-bold text-rialo-dark animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            🎮 Rialo Games Portal
          </h1>
          <p 
            className="mt-4 text-lg md:text-xl text-rialo-dark/70 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            A collection of frustratingly fun games.
          </p>
        </div>

        {/* Game Cards Block */}
        <main 
          className="mt-20 flex flex-wrap justify-center gap-10 animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
            {/* Snake Game Card */}
            <Link to="/snake" className="group perspective-[1000px]">
              <div className="text-center no-underline transition-all duration-500 transform-style-3d group-hover:rotate-x-[-3deg] group-hover:rotate-y-[5deg] group-hover:scale-105 rounded-lg shadow-xl w-72">
                <div className="flex items-center justify-center h-40 bg-rialo-mint rounded-t-lg">
                  <p className="text-5xl">🐍</p>
                </div>
                <div className="py-4 px-2 bg-white rounded-b-lg">
                  <h3 className="font-semibold text-xl text-rialo-dark">Snake Game Rialo Edition</h3>
                  <p className="text-sm text-rialo-dark/60 mt-1">The classic arcade game with a chaotic twist.</p>
                </div>
              </div>
            </Link>

            {/* Coming Soon Card */}
            <div className="group perspective-[1000px]">
               <div className="text-center no-underline rounded-lg shadow-lg opacity-50 cursor-not-allowed w-72">
                <div className="flex items-center justify-center h-40 bg-gray-300 rounded-t-lg">
                  <p className="text-5xl">⏳</p>
                </div>
                <div className="py-4 px-2 bg-gray-100 rounded-b-lg">
                  <h3 className="font-semibold text-xl text-gray-500">Coming Soon...</h3>
                   <p className="text-sm text-gray-400 mt-1">More games are on the way!</p>
                </div>
              </div>
            </div>
        </main>
      </div>

      {/* Footer */}
      <footer 
        className="relative z-10 w-full text-center py-4 animate-fade-in"
        style={{ animationDelay: '0.5s' }}
      >
        <p className="text-sm text-gray-500">Powered by Avery Acee</p>
      </footer>
    </div>
  );
};

export default HomePage;
