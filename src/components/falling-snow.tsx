
import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  size: number;
  left: string;
  animationDuration: string;
  animationDelay: string;
}

const FallingSnow: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 2, // Particles between 2 and 5px
      left: Math.random() * 100 + '%',
      animationDuration: Math.random() * 20 + 10 + 's', // Animation duration between 5 and 15 seconds
      animationDelay: Math.random() * 10 + 's',
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="snow-container">
      <div className="fixed shiny-glow w-full h-full"></div>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
          }}
        ></div>
      ))}
    </div>
  );
};

export default FallingSnow;
