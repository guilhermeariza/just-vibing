'use client';

import { Card as CardType } from '@/types/game';
import { getCardSymbol, getCardDisplay } from '@/lib/truco-logic';

interface ModernCardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  faceDown?: boolean;
  isManilha?: boolean;
  isWinning?: boolean;
  animationState?: 'idle' | 'dealing' | 'playing' | 'won';
}

export function ModernCard({
  card,
  onClick,
  disabled,
  size = 'md',
  faceDown,
  isManilha = false,
  isWinning = false,
  animationState = 'idle',
}: ModernCardProps) {
  const isRed = card.suit === 'ouros' || card.suit === 'copas';

  const sizeClasses = {
    sm: 'w-16 h-24 text-base',
    md: 'w-20 h-32 text-lg',
    lg: 'w-24 h-36 text-xl',
    xl: 'w-32 h-48 text-2xl',
  };

  const animationClasses = {
    idle: '',
    dealing: 'animate-card-deal',
    playing: 'animate-card-flip',
    won: 'animate-glow-pulse',
  };

  if (faceDown) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          rounded-xl border-2 border-truco-gray-300
          bg-gradient-to-br from-truco-green-900 to-truco-green-700
          shadow-lg flex items-center justify-center
          relative overflow-hidden
        `}
        role="img"
        aria-label="Carta virada para baixo"
      >
        <div className="absolute inset-0 bg-[url('/pattern-naipes.svg')] opacity-10" />
        <div className="text-5xl text-truco-gold-500 font-display">🂠</div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`${getCardDisplay(card.rank)} ${card.suit}`}
      aria-disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${animationClasses[animationState]}
        rounded-xl border-2 font-heading
        ${isManilha ? 'border-truco-gold-500 shadow-glow' : 'border-truco-gray-300'}
        ${isWinning ? 'animate-glow-pulse' : ''}
        bg-white shadow-lg
        flex flex-col items-center justify-between p-2
        transition-all duration-normal
        ${onClick && !disabled ? 'hover:scale-110 hover:shadow-xl hover:-translate-y-2 cursor-pointer active:scale-95' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        relative overflow-hidden
      `}
    >
      {/* Corner top-left */}
      <div className={`absolute top-1 left-1 flex flex-col items-center leading-none ${isRed ? 'text-truco-red-500' : 'text-truco-black'}`}>
        <span className="font-bold text-sm">{getCardDisplay(card.rank)}</span>
        <span className="text-xs">{getCardSymbol(card.suit)}</span>
      </div>

      {/* Center symbol */}
      <div className={`flex-1 flex items-center justify-center text-4xl ${isRed ? 'text-truco-red-500' : 'text-truco-black'}`}>
        {getCardSymbol(card.suit)}
      </div>

      {/* Corner bottom-right */}
      <div className={`absolute bottom-1 right-1 flex flex-col-reverse items-center leading-none rotate-180 ${isRed ? 'text-truco-red-500' : 'text-truco-black'}`}>
        <span className="font-bold text-sm">{getCardDisplay(card.rank)}</span>
        <span className="text-xs">{getCardSymbol(card.suit)}</span>
      </div>

      {/* Manilha indicator */}
      {isManilha && (
        <div className="absolute top-0 right-0 bg-truco-gold-500 text-white text-xs px-1 rounded-bl">
          ★
        </div>
      )}
    </button>
  );
}
