import { http, HttpResponse } from 'msw';

// Default handlers for common API endpoints used by integration tests.
// Individual tests can override these with server.use(...)
export const handlers = [
  // Example users endpoint
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: '1', name: 'Test User' }]);
  }),
];
