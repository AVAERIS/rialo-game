import React from 'react';
import { motion } from 'framer-motion';
import rialoLogo from '../assets/logo.png';

interface CircularTimerProps {
  progress: number; 
}

const CircularTimer: React.FC<CircularTimerProps> = ({ progress }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <svg className="w-28 h-28 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 100 100">
      
      <circle
        className="text-gray-300/20"
        strokeWidth="8"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="50"
        cy="50"
      />
      
      <motion.circle
        className="text-yellow-400"
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="50"
        cy="50"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.3, ease: "linear" }}
      />
      <image href={rialoLogo} x="15" y="15" height="70" width="70" transform="rotate(90 50 50)" className="glowing-logo-animation" />
    </svg>
  );
};

export default CircularTimer;