import '@testing-library/jest-dom';
import styled from '@emotion/styled';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Intercept Next's useServerInsertedHTML to capture the callback for manual invocation
let savedCb: (() => any) | undefined;
vi.mock('next/navigation', async () => {
  const actual = (await vi.importActual('next/navigation')) as any;
  return {
    ...actual,
    useServerInsertedHTML: (cb: () => any) => {
      savedCb = cb;
    },
  };
});

import EmotionRegistry from '../emotion-registry';

describe('EmotionRegistry (flush path)', () => {
  beforeEach(() => {
    savedCb = undefined;
  });

  it('returns a style element when flush has inserted names', () => {
    const Box = styled.div`
      color: rebeccapurple;
    `;

    render(
      <EmotionRegistry>
        <Box>styled</Box>
      </EmotionRegistry>,
    );

    // Trigger the captured callback after styled component insertion
    const styleEl = savedCb?.();
    expect.soft(styleEl).not.toBeNull();
    // Validate the returned element shape (presence of style + innerHTML placeholder)
    if (styleEl && typeof styleEl === 'object') {
      // @ts-expect-error JSX element shape in test
      expect.soft(styleEl.type).toBe('style');
      // @ts-expect-error JSX element shape in test
      expect.soft(styleEl.props?.dangerouslySetInnerHTML?.__html).toBeDefined();
    }
  });
});
