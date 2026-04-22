import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrucoButton } from '../TrucoButton';

describe('TrucoButton', () => {
  it('should render call variant with correct text', () => {
    render(<TrucoButton variant="call" onClick={() => {}} />);
    expect(screen.getByText('🔥 TRUCO!')).toBeInTheDocument();
  });

  it('should render accept variant with correct text', () => {
    render(<TrucoButton variant="accept" onClick={() => {}} />);
    expect(screen.getByText('✅ ACEITAR')).toBeInTheDocument();
  });

  it('should render refuse variant with correct text', () => {
    render(<TrucoButton variant="refuse" onClick={() => {}} />);
    expect(screen.getByText('🏳️ CORRER')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<TrucoButton variant="call" onClick={handleClick} />);
    screen.getByText('🔥 TRUCO!').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<TrucoButton variant="call" onClick={handleClick} disabled />);
    screen.getByText('🔥 TRUCO!').click();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply waiting animation when state is waiting', () => {
    const { container } = render(
      <TrucoButton variant="call" onClick={() => {}} state="waiting" />
    );
    expect(container.querySelector('.animate-scale-pulse')).toBeInTheDocument();
  });
});
