import React from 'react';

const RotateDeviceOverlay: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: 'Poppins, sans-serif',
    }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: 'rotate-icon 2s linear infinite' }}
      >
        <path d="M21.5 12a9.5 9.5 0 1 1-9.5-9.5" />
        <path d="M12 2v10" />
        <path d="m16 6-4-4-4 4" />
      </svg>
      <p style={{ marginTop: '20px', fontSize: '18px', textAlign: 'center', padding: '0 20px' }}>
        Please rotate your device to landscape mode to play.
      </p>
      <style>
        {`
          @keyframes rotate-icon {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default RotateDeviceOverlay;
