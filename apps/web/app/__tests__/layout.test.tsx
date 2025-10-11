import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import RootLayout from '../layout';

describe('RootLayout', () => {
  it('renders children inside app-root with providers and emotion registry', () => {
    render(
      <RootLayout>
        <div data-testid="child">content</div>
      </RootLayout>,
    );

    // The app-root data-testid is set in layout
    const root = screen.getByTestId('app-root');
    expect.soft(root).toBeInTheDocument();
    expect.soft(root).toHaveTextContent('content');
  });
});
