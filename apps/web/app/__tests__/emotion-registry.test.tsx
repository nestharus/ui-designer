import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import EmotionRegistry from '../emotion-registry';

describe('EmotionRegistry', () => {
  it('renders children without crashing', () => {
    // Arrange / Act
    render(
      <EmotionRegistry>
        <div data-testid="child">hello</div>
      </EmotionRegistry>,
    );

    // Assert
    expect.soft(screen.getByTestId('child')).toHaveTextContent('hello');
  });
});
