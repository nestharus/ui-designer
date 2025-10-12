import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '../page';

describe('HomePage', () => {
  it('should render the main heading', () => {
    render(<HomePage />);
    const heading = screen.getByText(/ui designer/i);
    expect(heading).toBeInTheDocument();
  });

  it('should display the platform description', () => {
    render(<HomePage />);
    const description = screen.getByText(/agentic design collaboration platform/i);
    expect(description).toBeInTheDocument();
  });

  it('should show technology stack information', () => {
    render(<HomePage />);
    const techStack = screen.getByText(/built with next.js 15/i);
    expect(techStack).toBeInTheDocument();
  });
});
