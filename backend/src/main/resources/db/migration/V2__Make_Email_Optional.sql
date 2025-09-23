-- Remove email field from users table since it's not needed
ALTER TABLE users DROP COLUMN email;
