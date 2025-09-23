export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  quantityAvailable: number;
  imageUrl?: string;
  category?: string;
  sku?: string;
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
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
