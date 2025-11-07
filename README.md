# MorFit Studio Suite

A visually stunning and high-performance management suite for modern fitness studios, streamlining scheduling, member management, and financial tracking.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/arelbir/generated-app-20250928-130909)

## Overview

MorFit is a comprehensive, mobile-first management platform for modern fitness studios, built on Cloudflare's serverless infrastructure. It aims to modernize an existing feature-rich system by focusing on a superior user experience, performance, and accessibility. The application provides a suite of tools to manage day-to-day studio operations efficiently.

## Key Features

-   **📅 Real-time Session Dashboard:** An interactive, grid-based calendar for booking and viewing sessions for different equipment (e.g., Vacu, Roll) with intuitive color-coded status indicators.
-   **👥 Comprehensive Member Management:** A robust system to handle client profiles, from demo status to full membership, including detailed tabs for personal information, health conditions, body measurements, and active packages.
-   **💰 Financial Management:** Clear insights into studio finances with a monthly income statement and a daily cashbook to track all monetary transactions.
-   **📦 Package & Device Management:** An integrated system that allows for easy configuration of services, packages, and studio equipment.
-   **📊 Reporting & Audit Trail:** A comprehensive reporting module to track all system activities, view expired packages, and maintain operational transparency.
-   **✨ Modern UI/UX:** A beautiful, minimalist interface built with Shadcn/UI, focusing on a clean aesthetic, smooth animations, and a delightful user experience.

## Technology Stack

-   **Frontend:** React, Vite, TypeScript, React Router
-   **UI:** Tailwind CSS, Shadcn/UI, Framer Motion, Lucide React
-   **State Management:** Zustand
-   **Backend:** Node.js, Express.js, TypeScript
-   **Database:** Supabase PostgreSQL
-   **ORM:** Drizzle ORM
-   **Development:** Concurrently (frontend + backend)

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

-   Node.js (v18.0 or later)
-   [Bun](https://bun.sh/) package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/morfit-studio-suite.git
    cd morfit-studio-suite
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    ```bash
    cp .env.example .env
    ```
    Edit `.env` file and add your Supabase PostgreSQL connection string.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres?sslmode=require"

# Development Environment
NODE_ENV=development
```

**Required Environment Variables:**
- `DATABASE_URL`: Your Supabase PostgreSQL connection string with SSL

### Running Locally

To run the application locally, you'll need to start both the Vite development server for the frontend and the Express.js backend server.

1.  **Start both frontend and backend concurrently:**
    ```bash
    npm run dev:full
    ```
    This will start:
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:3001

2.  **Or start them separately:**
    ```bash
    # Terminal 1 - Backend
    npm run dev:backend

    # Terminal 2 - Frontend
    npm run dev
    ```

The application will be available at `http://localhost:3000` with the backend API running on `http://localhost:3001`.

## Project Structure

The project is organized into the following directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and utility functions.
-   `backend/`: Contains the Express.js backend server code, including API routes and database connections.
-   `db/`: Contains Drizzle ORM schema definitions and database migrations.
-   `shared/`: Contains TypeScript types and mock data shared between the frontend and backend to ensure type safety.
-   `docs/`: Project documentation and development guides.

## Development

### Adding API Endpoints

New API routes should be added in the `backend/server.ts` file. Follow the existing patterns using Express.js and the Drizzle ORM for database operations.

### Database Schema

Database schema is defined using Drizzle ORM in the `db/schema.ts` file. To add new tables or modify existing ones:

1. Edit `db/schema.ts` to define your schema
2. Generate migrations: `npx drizzle-kit generate`
3. Apply migrations to your database

### Shared Types

To maintain type safety between the client and server, define all shared data structures in `shared/types.ts`.

## Production Deployment

This application can be deployed to any platform that supports Node.js applications:

- **Frontend**: Deploy to Vercel, Netlify, or any static hosting service
- **Backend**: Deploy to Heroku, Railway, Render, or any Node.js hosting service
- **Database**: Supabase PostgreSQL (already configured)

### Deployment Steps:

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy backend to your Node.js hosting service**
   Set environment variables in your hosting platform:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `NODE_ENV`: production
   - `PORT`: 3001 (or your hosting platform's port)

3. **Deploy frontend to static hosting**
   Update API base URL in your frontend to point to your deployed backend

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.