# AIO Analysis Tool Playground

This web application allows users to assess how well their site's `robots.txt` file is optimized for AI-based crawlers, helping them improve their AI optimization strategies.

## Overview

The tool enables users to:

- Input a domain or URL.
- Fetch and parse the `robots.txt` file of the specified site.
- Analyze the configuration to determine if the site is optimized for AI crawlers.
- Receive optimization recommendations to improve site accessibility for AI crawlers.

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: React

## Getting Started

### Prerequisites

- Node.js (v18.x or later recommended)
- npm or yarn

### Setup

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd profound-fe
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

## Project Structure (Simplified)

```
profound-fe/
├── src/
│   ├── app/                # Next.js App Router pages
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

## Key Features & Requirements (from spec.md)

### Input & Parsing

- User-friendly input field for domain/URL.
- Input validation and error handling.

### robots.txt Fetching and Analysis

- Retrieve and parse `robots.txt`.
- Analyze for AI crawler blocking/allowance.
- User-friendly permission overview.

### Recommendation Engine

- Suggest improvements for `robots.txt` based on analysis.
- Clear presentation of recommendations.

### User Interface (UI)

- Beautiful, responsive, accessible, and visually engaging.
- Use React and Next.js.
- Loading indicators, feedback, and state handling (loading, errors, results).

## Evaluation Criteria (from spec.md)

- **Technical Implementation**: Accurate `robots.txt` parsing and interpretation, real-time fetching.
- **User Experience (UX)**: Loading states, error handling, visual feedback.
- **Design**: Clean, consistent, user-friendly UI, accessibility focus.
- **Code Quality**: Clean, modular, maintainable code, comments, documentation.
- **Innovation**: Added features or creative design enhancing usability.
