'use client';

import { useEffect, useState } from 'react';

interface TrucoFireworksProps {
  isActive: boolean;
  intensity?: 'truco' | 'seis' | 'nove' | 'doze';
}

export function TrucoFireworks({ isActive, intensity = 'truco' }: TrucoFireworksProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Número de partículas baseado na intensidade
    const particleCount = {
      truco: 20,
      seis: 30,
      nove: 40,
      doze: 50,
    }[intensity];

    // Gera partículas em posições aleatórias
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.3,
    }));

    setParticles(newParticles);
  }, [isActive, intensity]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-10">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 animate-firework"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-500 to-yellow-400 rounded-full shadow-lg blur-sm" />
        </div>
      ))}
    </div>
  );
}
