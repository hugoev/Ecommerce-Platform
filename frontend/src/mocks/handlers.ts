import { http, HttpResponse } from 'msw'

export const handlers = [
  // Passthrough for placeholder images
  http.get('https://via.placeholder.com/*', ({ request }) => {
    return fetch(request)
  }),

  // Mock for user registration
  http.post('/api/auth/register', async ({ request }) => {
    try {
      const newUser = await request.json();
      console.log('MSW: Intercepted REGISTER request with:', newUser);
      return HttpResponse.json({
        id: '1',
        name: (newUser as any).name,
        email: (newUser as any).email,
      }, { status: 201 });
    } catch (error) {
      console.error('MSW: Error parsing register request body:', error);
      return HttpResponse.json({ message: 'Bad Request: Malformed JSON.' }, { status: 400 });
    }
  }),

  // Mock for user login
  http.post('/api/auth/login', async ({ request }) => {
    try {
      const credentials = await request.json();
      console.log('MSW: Intercepted LOGIN request with:', credentials);
      if ((credentials as any).email) {
        return HttpResponse.json({
          id: '1',
          name: 'Test User',
          email: (credentials as any).email,
        }, { status: 200 });
      } else {
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }
    } catch (error) {
      console.error('MSW: Error parsing login request body:', error);
      return HttpResponse.json({ message: 'Bad Request: Malformed JSON.' }, { status: 400 });
    }
  }),
]
