import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  isPaused?: boolean;
}

const AudioVisualizer = ({ isActive, isPaused = false }: AudioVisualizerProps) => {
  // Number of bars in the visualizer
  const bars = 9;
  
  return (
    <div className={`relative flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-40'}`}>
      <div className="w-16 h-16 md:w-20 md:h-20 bg-light-red-500 rounded-full flex items-center justify-center">
        <div className="flex items-end h-8 space-x-0.5 px-2">
          {Array.from({ length: bars }).map((_, index) => (
            <div
              key={index}
              className={`w-1 bg-white rounded-full ${
                isActive && !isPaused
                  ? `animate-sound-wave${index % 3 === 0 ? '' : index % 3 === 1 ? '-alt' : '-delay'}`
                  : 'h-2'
              }`}
              style={{
                animationDelay: isActive ? `${index * 0.1}s` : '0s',
                height: isActive && !isPaused ? (Math.random() * 16 + 4) + 'px' : '8px'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;