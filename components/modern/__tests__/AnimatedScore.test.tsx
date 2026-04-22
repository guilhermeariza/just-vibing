import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedScore } from '../AnimatedScore';

describe('AnimatedScore', () => {
  it('should render score', () => {
    render(<AnimatedScore score={5} teamColor="blue" />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render label when provided', () => {
    render(<AnimatedScore score={5} teamColor="blue" label="Time 1" />);
    expect(screen.getByText('Time 1')).toBeInTheDocument();
  });

  it('should apply blue color class for blue team', () => {
    const { container } = render(<AnimatedScore score={5} teamColor="blue" />);
    expect(container.querySelector('.text-blue-600')).toBeInTheDocument();
  });

  it('should apply red color class for red team', () => {
    const { container } = render(<AnimatedScore score={5} teamColor="red" />);
    expect(container.querySelector('.text-red-600')).toBeInTheDocument();
  });

  it('should display points label', () => {
    render(<AnimatedScore score={5} teamColor="blue" />);
    expect(screen.getByText('⚡ pontos')).toBeInTheDocument();
  });
});
