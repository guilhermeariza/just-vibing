'use client';

interface TrucoButtonProps {
  variant: 'call' | 'accept' | 'refuse';
  onClick: () => void;
  disabled?: boolean;
  state?: 'idle' | 'waiting';
}

export function TrucoButton({
  variant,
  onClick,
  disabled = false,
  state = 'idle',
}: TrucoButtonProps) {
  const variants = {
    call: {
      bg: 'gradient-fire',
      text: '🔥 TRUCO!',
      hoverClass: 'hover:shadow-glow',
    },
    accept: {
      bg: 'bg-green-600 hover:bg-green-700',
      text: '✅ ACEITAR',
      hoverClass: 'hover:shadow-lg',
    },
    refuse: {
      bg: 'bg-white border-2 border-truco-gray-300 text-truco-gray-900 hover:border-red-500 hover:text-red-600',
      text: '🏳️ CORRER',
      hoverClass: 'hover:shadow-md',
    },
  };

  const config = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${config.bg}
        ${config.hoverClass}
        ${state === 'waiting' ? 'animate-scale-pulse' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        w-full py-3 px-6 rounded-xl
        font-heading font-bold text-lg
        ${variant !== 'refuse' ? 'text-white' : ''}
        shadow-md
        transition-all duration-normal
        active:scale-95
      `}
      aria-label={config.text}
    >
      {config.text}
    </button>
  );
}
