# --- Stage 1: Build the React application ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
# Copy package-lock.json if it exists, otherwise install without it
COPY package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the static files
RUN npm run build

# --- Stage 2: Serve the static files with Nginx ---
FROM nginx:stable-alpine

# Copy the built static files from the builder stage to the Nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy a custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
