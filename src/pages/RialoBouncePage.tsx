import React, { useState, useEffect } from 'react';
import RialoBounceCanvas from '../components/RialoBounceCanvas';
import { Link } from 'react-router-dom';
import bgBounce from '../assets/bgBounce.png';
import RotateDeviceOverlay from '../components/RotateDeviceOverlay';

const RialoBouncePage: React.FC = () => {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('waiting');
  const [isHovered, setIsHovered] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };

    window.addEventListener('resize', checkOrientation);
    checkOrientation(); // Initial check

    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const buttonStyle: React.CSSProperties = {
    fontFamily: 'Poppins, sans-serif',
    color: 'white',
    textDecoration: 'none',
    padding: '15px 30px',
    background: isHovered ? 'linear-gradient(to right, #b21f1f, #fdbb2d)' : 'linear-gradient(to right, #fdbb2d, #b21f1f)',
    borderRadius: '50px',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    fontSize: '18px',
    fontWeight: 'bold',
  };

  if (isPortrait) {
    return <RotateDeviceOverlay />;
  }

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Poppins, sans-serif',
      padding: '20px',
      backgroundImage: `url(${bgBounce})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '72px', color: 'white', textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #f09, 0 0 40px #f09, 0 0 50px #f09, 0 0 60px #f09, 0 0 70px #f09' }}>Rialo Bounce</h1>
      </div>
      {gameState === 'playing' && <div style={{ color: 'white', fontSize: '32px', marginBottom: '20px', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Score: {score}</div>}
      <RialoBounceCanvas
        setScore={setScore}
        gameState={gameState}
        setGameState={setGameState}
      />
      <div style={{ marginTop: '30px' }}>
        <Link
          to="/"
          style={buttonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default RialoBouncePage;
