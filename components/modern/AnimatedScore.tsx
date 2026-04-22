'use client';

import { useEffect, useState } from 'react';

interface AnimatedScoreProps {
  score: number;
  teamColor: 'blue' | 'red';
  label?: string;
}

export function AnimatedScore({ score, teamColor, label }: AnimatedScoreProps) {
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    if (score !== displayScore) {
      const increment = score > displayScore ? 1 : -1;
      const timer = setInterval(() => {
        setDisplayScore((prev) => {
          if ((increment > 0 && prev >= score) || (increment < 0 && prev <= score)) {
            clearInterval(timer);
            return score;
          }
          return prev + increment;
        });
      }, 50);

      return () => clearInterval(timer);
    }
  }, [score, displayScore]);

  const colorClass = teamColor === 'blue' ? 'text-blue-600' : 'text-red-600';

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-sm font-body font-semibold text-truco-gray-700 uppercase">
          {label}
        </span>
      )}
      <span
        className={`
          ${colorClass}
          font-display text-6xl
          transition-all duration-fast
          ${displayScore !== score ? 'scale-110' : 'scale-100'}
        `}
      >
        {displayScore}
      </span>
      <span className="text-xs text-truco-gray-500">⚡ pontos</span>
    </div>
  );
}
