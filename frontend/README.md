# E-commerce Platform Frontend

## 1. Overview

This repository contains the frontend for the E-commerce Platform, a modern, database-driven online shopping site. This application is built with React and serves as the client-side interface for users to browse products, manage their accounts, and complete purchases.

This project emphasizes a professional, scalable architecture and a clean, maintainable codebase.

## 2. Core Technologies & Architecture

To achieve our goals of scalability and maintainability, we have chosen a modern, industry-standard tech stack and a robust architectural pattern.

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/) for a fast and efficient development experience.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for static typing, which improves code quality and developer confidence.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) for a utility-first approach to building a consistent and modern user interface.
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) is used for centralized and predictable state management. We adhere to a "feature-sliced" pattern (e.g., `src/app/features/auth`) to keep state logic organized and scalable.
- **API Communication**: We use a **dedicated API layer** (`src/api`) to decouple our application logic from our data-fetching logic. This makes the app easier to maintain and test.
- **API Mocking**: [Mock Service Worker (MSW)](https://mswjs.io/) is integrated to provide high-fidelity API mocking during development. This allows for independent frontend development and robust testing.

## 3. Getting Started

Follow these instructions to get the frontend running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended, e.g., 18.x or 20.x)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation & Setup

1.  **Clone the repository** (if you haven't already).

2.  **Navigate to the frontend directory**:
    ```sh
    cd frontend
    ```

3.  **Install dependencies**:
    ```sh
    npm install
    ```

4.  **Set up environment variables**:
    Create a local environment file by copying the example file.
    ```sh
    cp .env.example .env
    ```
    This file contains the base URL for the backend API. The default is set up for a local Spring Boot server.

5.  **Run the development server**:
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port). The development server includes hot module replacement and integrated API mocking via MSW.

## 4. Available Scripts

- `npm run dev`: Starts the development server with API mocking enabled.
- `npm run build`: Compiles and bundles the application for production.
- `npm run lint`: Runs the ESLint static analysis to find and fix problems in the codebase.
- `npm run preview`: Starts a local server to preview the production build.

## 5. Environment Variables

The application uses environment variables for configuration. These are managed in the `.env` file, which is ignored by Git.

- `VITE_API_BASE_URL`: The base URL of the backend API. (e.g., `http://localhost:8080`)

*Note: Only variables prefixed with `VITE_` are exposed to the client-side code.*

## 6. Project Structure

The project follows a feature-oriented structure to promote scalability and separation of concerns.

```
frontend/
├── public/              # Static assets, including the MSW service worker
└── src/
    ├── api/             # Centralized API communication layer
    ├── app/             # Redux store and feature slices
    │   └── features/
    ├── assets/          # Static assets like images, fonts (if any)
    ├── components/      # Reusable React components
    │   └── ui/          # Low-level UI primitives (shadcn/ui)
    ├── lib/             # Utility functions and library configurations
    ├── mocks/           # MSW API mock definitions
    ├── pages/           # Top-level, routable page components
    ├── types/           # Shared TypeScript type definitions and interfaces
    ├── App.tsx          # Root component with routing setup
    └── main.tsx         # Application entry point
```