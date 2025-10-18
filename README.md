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
-   **Backend:** Cloudflare Workers, Hono
-   **Storage:** Cloudflare Durable Objects
-   **Deployment:** Cloudflare

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

-   Node.js (v18.0 or later)
-   [Bun](https://bun.sh/) package manager
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

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

### Running Locally

To run the application locally, you'll need to start both the Vite development server for the frontend and the Wrangler development server for the backend worker.

1.  **Start the local development server:**
    This command will start the Vite frontend and the Wrangler backend concurrently.
    ```bash
    wrangler dev
    ```
    The application will be available at `http://localhost:8788`.

## Project Structure

The project is organized into three main directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the Cloudflare Worker backend code, including the Hono application, API routes, and Durable Object entity definitions.
-   `shared/`: Contains TypeScript types and mock data shared between the frontend and backend to ensure type safety.

## Development

### Adding API Endpoints

New API routes should be added in the `worker/user-routes.ts` file. Follow the existing patterns using Hono and the provided response helpers from `worker/core-utils.ts`.

### Creating Durable Object Entities

New data models should be defined as classes extending `IndexedEntity` in `worker/entities.ts`. This pattern provides a structured way to interact with Cloudflare Durable Objects for stateful storage.

### Shared Types

To maintain type safety between the client and server, define all shared data structures in `shared/types.ts`.

## Deployment

This project is configured for seamless deployment to Cloudflare.

1.  **Build the application:**
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    Make sure you are logged in to your Cloudflare account via the Wrangler CLI (`wrangler login`).
    ```bash
    bun run deploy
    ```
    This command will build the Vite application and deploy it along with the worker to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/arelbir/generated-app-20250928-130909)

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.