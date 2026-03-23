import { Card as CardType } from '@/types/game';
import { getCardSymbol, getCardDisplay } from '@/lib/truco-logic';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
}

export function Card({ card, onClick, disabled, size = 'md', faceDown }: CardProps) {
  const isRed = card.suit === 'ouros' || card.suit === 'copas';

  const sizeClasses = {
    sm: 'w-16 h-24 text-lg',
    md: 'w-20 h-28 text-xl',
    lg: 'w-24 h-36 text-2xl',
  };

  // Gera descrição acessível da carta
  const suitNames = {
    ouros: 'de Ouros',
    copas: 'de Copas',
    espadas: 'de Espadas',
    paus: 'de Paus',
  };
  const ariaLabel = `${getCardDisplay(card.rank)} ${suitNames[card.suit]}`;

  if (faceDown) {
    return (
      <div
        role="img"
        aria-label="Carta virada para baixo"
        className={`${sizeClasses[size]} rounded-lg border-2 border-gray-400 bg-gradient-to-br from-blue-900 to-blue-700 shadow-lg flex items-center justify-center`}
      >
        <div className="text-4xl text-blue-300">🂠</div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`
        ${sizeClasses[size]}
        rounded-lg border-2 border-gray-300 bg-white shadow-lg
        flex flex-col items-center justify-between p-2
        transition-all duration-200
        ${onClick && !disabled ? 'hover:scale-110 hover:shadow-xl cursor-pointer active:scale-95' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className={`font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
        {getCardDisplay(card.rank)}
      </div>
      <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
        {getCardSymbol(card.suit)}
      </div>
      <div className={`font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
        {getCardDisplay(card.rank)}
      </div>
    </button>
  );
}
