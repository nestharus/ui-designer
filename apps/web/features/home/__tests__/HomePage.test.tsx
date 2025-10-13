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
    const { container } = render(<HomePage />);
    // Rocket
    const rocketIcon = container.querySelector('svg[data-icon="rocket"]');
    expect.soft(rocketIcon).toBeInTheDocument();
    expect.soft(rocketIcon).toBeVisible();
    // Coffee or mug-saucer (rename in FA v6+)
    const coffeeOrMugIcon = container.querySelector(
      'svg[data-icon="coffee"], svg[data-icon="mug-saucer"]',
    );
    expect.soft(coffeeOrMugIcon).toBeInTheDocument();
    expect.soft(coffeeOrMugIcon).toBeVisible();
    // GitHub
    const githubIcon = container.querySelector('svg[data-icon="github"]');
    expect.soft(githubIcon).toBeInTheDocument();
    expect.soft(githubIcon).toBeVisible();
  });
});
