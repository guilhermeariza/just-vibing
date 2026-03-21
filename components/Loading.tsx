'use client';

import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`${sizes[size]} animate-spin ${className}`} />
  );
}

export function LoadingSpinner({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" className="text-green-600 mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-10 w-24 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="p-2 rounded bg-white border border-gray-300 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}

export function CardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-16 h-24',
    md: 'w-20 h-28',
    lg: 'w-24 h-36',
  };

  return (
    <div
      className={`${sizes[size]} rounded-lg border-2 border-gray-300 bg-gray-200 animate-pulse`}
    />
  );
}
