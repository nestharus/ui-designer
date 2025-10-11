import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Page from '../page';

// Mock the HomePage component to validate wrapper rendering
vi.mock('@/features/home/HomePage', () => ({
  default: () => <div data-testid="home-page-mock" />,
}));

describe('app/page wrapper', () => {
  it('renders HomePage component', () => {
    render(<Page />);
    expect.soft(screen.getByTestId('home-page-mock')).toBeInTheDocument();
  });
});
