import type { LoginCredentials, RegisterData } from '@/types';
import { http, HttpResponse } from 'msw';

export const handlers = [

  // Mock for user registration
  http.post('/api/auth/register', async ({ request }) => {
    try {
      const newUser = await request.json() as RegisterData;
      console.log('MSW: Intercepted REGISTER request with:', newUser);
      return HttpResponse.json({
        id: '1',
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      }, { status: 201 });
    } catch (error) {
      console.error('MSW: Error parsing register request body:', error);
      return HttpResponse.json({ message: 'Bad Request: Malformed JSON.' }, { status: 400 });
    }
  }),

  // Mock for user login
  http.post('/api/auth/login', async ({ request }) => {
    try {
      const credentials = await request.json() as LoginCredentials;
      console.log('MSW: Intercepted LOGIN request with:', credentials);
      if (credentials.username) {
        return HttpResponse.json({
          id: '1',
          username: credentials.username,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
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
