# AEO Analysis Tool Playground

<img width="1466" alt="Screenshot 2025-05-08 at 8 59 51 PM" src="https://github.com/user-attachments/assets/17b1b6ca-365f-472c-a578-37d09fd005ab" />

---

Deployed at: https://aeo-analysis-kohl.vercel.app/dashboard

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

## Robots.txt Analysis Criteria

The application evaluates robots.txt files based on a comprehensive set of criteria to determine AI crawler friendliness. The analysis examines:

**1. Accessibility & Format**:

- Validates that the robots.txt file is accessible (returns 200 OK)
- Ensures the file size is reasonable (<512 KB)
- Checks for proper UTF-8 encoding

**2. AI User-Agent Recognition**:

- Identifies specific AI crawler user-agents including:
  - GPTBot (OpenAI)
  - ClaudeBot (Anthropic)
  - PerplexityBot
  - Google-Extended
  - ccbot (Common Crawl)
  - YouBot
- Evaluates whether these crawlers are explicitly allowed or disallowed

**3. Rule Structure & Consistency**:

- Checks for global disallow rules (`User-agent: * Disallow: /`)
- Analyzes rule precedence to identify conflicts between Allow and Disallow directives
- Detects problematic wildcard patterns that could cause issues

**4. Additional Features**:

- Identifies presence of Sitemap directives and validates their URLs
- Checks for Crawl-delay directives (which are generally discouraged)

**5. Scoring System**:
The analysis produces a score (0-100) based on:

- Accessibility (40 points): File availability and reasonable size
- AI Allowance (30 points): Proper configuration for AI crawlers
- Syntax Hygiene (15 points): Proper formatting and directive usage
- Sitemaps (10 points): Presence of valid sitemap declarations
- Conflict Avoidance (5 points): Clean precedence rules

The analysis results include detailed recommendations for optimizing robots.txt configuration specifically for AI crawlers, helping site owners make informed decisions about content accessibility.

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

**1. Next.js App Router (`app/`)**:

- The core of the application's routing and page structure resides here.
- `layout.tsx`: Defines the main layout applied across the application.
- `page.tsx`: Represents the entry point and primary UI for the main application page.
- Leverages Next.js features for Server Components, Client Components, and efficient data fetching patterns.

**2. Reusable UI Components (`components/`)**:

- This directory contains all custom React components designed for reusability across different parts of the application.
- Promotes a consistent look and feel, and simplifies development by breaking down the UI into smaller, manageable pieces.

**3. Shared Logic and Utilities (`lib/`)**:

- Houses utility functions, API interaction logic (e.g., for fetching and parsing `robots.txt`), custom hooks, and TypeScript type definitions.
- Centralizes common functionalities, making them easily accessible and maintainable.

**4. Static Assets (`public/`)**:

- Contains static files like images, fonts, and other assets that are served directly by the web server.
