# AIO Analysis Tool Playground

<img width="1466" alt="Screenshot 2025-05-08 at 8 59 51 PM" src="https://github.com/user-attachments/assets/17b1b6ca-365f-472c-a578-37d09fd005ab" />

---

Deployed at: https://aio-analysis-kohl.vercel.app/dashboard

This web application allows users to assess how well their site's `robots.txt` file is optimized for AI-based crawlers, helping them improve their AI optimization strategies.

## Overview

The tool enables users to:

- Input a domain or URL.
- Fetch and parse the `robots.txt` file of the specified site.
- Analyze the configuration to determine if the site is optimized for AI crawlers.
- Receive optimization recommendations to improve site accessibility for AI crawlers.

## Core Technologies & Libraries

This project is built with a modern web stack:

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Library**: [React](https://reactjs.org/)

## Getting Started

### Prerequisites

- Node.js (v18.x or later recommended)
- npm or yarn

### Setup

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <repository-url>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

Execute the following command to start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Architecture Overview

This project is built using Next.js and its App Router, emphasizing a structured and maintainable codebase. The architecture revolves around the following key areas:

**1. Next.js App Router (`src/app/`)**:

- The core of the application's routing and page structure resides here.
- `layout.tsx`: Defines the main layout applied across the application.
- `page.tsx`: Represents the entry point and primary UI for the main application page.
- Leverages Next.js features for Server Components, Client Components, and efficient data fetching patterns.

**2. Reusable UI Components (`src/components/`)**:

- This directory contains all custom React components designed for reusability across different parts of the application.
- Promotes a consistent look and feel, and simplifies development by breaking down the UI into smaller, manageable pieces.

**3. Shared Logic and Utilities (`src/lib/`)**:

- Houses utility functions, API interaction logic (e.g., for fetching and parsing `robots.txt`), custom hooks, and TypeScript type definitions.
- Centralizes common functionalities, making them easily accessible and maintainable.

**4. Static Assets (`public/`)**:

- Contains static files like images, fonts, and other assets that are served directly by the web server.

**5. Configuration**:

- `next.config.mjs`: Manages Next.js specific configurations.
- `tsconfig.json`: Configures the TypeScript compiler.
- `package.json`: Lists project dependencies and defines runnable scripts.
- `.eslintrc.json`: Enforces code style and quality using ESLint.

**Simplified Project Structure:**

```
profound-fe/
├── src/
│   ├── app/                # Next.js App Router: routes, pages, layouts
│   │   ├── layout.tsx
│   │   └── page.tsx        # Main application page
│   ├── components/         # Reusable UI components
│   └── lib/                # Utility functions, API interactions
├── public/                 # Static assets
├── .eslintrc.json
├── next.config.mjs
├── package.json
├── README.md
├── spec.md
└── tsconfig.json
```
