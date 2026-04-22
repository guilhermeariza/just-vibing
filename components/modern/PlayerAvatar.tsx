'use client';

interface PlayerAvatarProps {
  name: string;
  team: 1 | 2;
  isReady?: boolean;
  isCurrentTurn?: boolean;
  isSelf?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayerAvatar({
  name,
  team,
  isReady = false,
  isCurrentTurn = false,
  isSelf = false,
  size = 'md',
}: PlayerAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
  };

  const teamColors = {
    1: 'bg-blue-500 border-blue-600',
    2: 'bg-red-500 border-red-600',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${sizeClasses[size]}
          ${teamColors[team]}
          ${isSelf ? 'ring-4 ring-truco-gold-500' : ''}
          ${isCurrentTurn ? 'animate-scale-pulse' : ''}
          rounded-full border-4
          flex items-center justify-center
          font-display text-white
          transition-all duration-normal
        `}
        aria-label={`Avatar de ${name}`}
      >
        {initials}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-body font-semibold text-sm ${isSelf ? 'text-truco-gold-700' : 'text-truco-gray-900'}`}>
            {name}
            {isSelf && ' (Você)'}
          </span>
          {isCurrentTurn && <span className="text-lg">🎯</span>}
        </div>
        {isReady && (
          <span className="text-green-600 text-xs font-medium flex items-center gap-1">
            <span>✓</span> Pronto
          </span>
        )}
      </div>
    </div>
  );
}
