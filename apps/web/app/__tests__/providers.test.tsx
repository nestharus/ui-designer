import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Hoist spy so it can be referenced in vi.mock
const { devtoolsSpy } = vi.hoisted(() => {
  return { devtoolsSpy: vi.fn(() => null) };
});

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: devtoolsSpy,
}));
import { Providers } from '../providers';

describe('Providers', () => {
  // Reset env between tests
  const originalEnv = process.env.NODE_ENV;
  beforeEach(() => {
    devtoolsSpy.mockClear();
  });
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it.each([
    { env: 'test', expectedDevtoolsCalls: 1, title: 'non-production shows devtools' },
    { env: 'production', expectedDevtoolsCalls: 0, title: 'production hides devtools' },
  ])('renders children and $title', ({ env, expectedDevtoolsCalls }) => {
    // Arrange
    process.env.NODE_ENV = env as any;

    // Act
    render(
      <Providers>
        <div data-testid="child">child</div>
      </Providers>,
    );

    // Assert
    expect.soft(screen.getByTestId('child')).toBeInTheDocument();
    expect.soft(devtoolsSpy).toHaveBeenCalledTimes(expectedDevtoolsCalls);
  });
});
