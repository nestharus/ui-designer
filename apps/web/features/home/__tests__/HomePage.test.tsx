import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import HomePage from '../HomePage';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    expect.soft(screen.getByRole('heading', { name: /ui designer/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<HomePage />);
    expect.soft(screen.getByText(/agentic design collaboration platform/i)).toBeInTheDocument();
  });

  it('renders Font Awesome icons', () => {
    render(<HomePage />);
    // Rocket
    expect.soft(document.querySelector('svg[data-icon="rocket"]')).toBeTruthy();
    // Coffee or mug-saucer (rename in FA v6+)
    const coffeeOrMug = document.querySelector(
      'svg[data-icon="coffee"], svg[data-icon="mug-saucer"]',
    );
    expect.soft(coffeeOrMug).toBeTruthy();
    // GitHub
    expect.soft(document.querySelector('svg[data-icon="github"]')).toBeTruthy();
  });
});
