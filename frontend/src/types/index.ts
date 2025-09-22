export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  quantityAvailable: number;
  imageUrl?: string;
  category?: string; // Note: This is a frontend-only concept for now
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
