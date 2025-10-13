import { describe, it, expect } from 'vitest';

import { GET } from '../route';

describe('API /api/hello GET', () => {
  it.each([
    {
      url: 'https://example.com/api/hello',
      expectedMessage: 'Hello from UI Designer API',
    },
    {
      url: 'https://example.com/api/hello?name=Alex',
      expectedMessage: 'Hello, Alex!',
    },
  ])('responds with greeting: $expectedMessage', async ({ url, expectedMessage }) => {
    // Arrange
    const request = { url } as any;

    // Act
    const res = GET(request);
    const json = await (res as Response).json();

    // Assert
    expect.soft(res.status).toBe(200);
    expect.soft(json.message).toBe(expectedMessage);
    expect.soft(typeof json.timestamp).toBe('string');
  });
});
