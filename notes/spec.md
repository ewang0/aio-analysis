# AI Optimization (AEO) Analysis Tool

In this assignment, you'll develop an AI Optimization (AEO) Analysis Tool as a web application playground. This tool will allow users to assess how well their site's robots.txt file is optimized for AI-based crawlers, helping them improve their AI optimization strategies.

## Assignment Overview

You'll build a web application where users can:

- Input a domain or URL to analyze.
- Fetch and parse the robots.txt file of the specified site.
- Analyze the configuration to determine if the site is optimized for AI crawlers, specifically checking for any allow/disallow directives that may hinder AI bots.
- Provide optimization recommendations based on the findings to improve the site's accessibility for AI crawlers.

Currently, the scope is limited to analyzing and recommending improvements to the robots.txt file, with future expansions planned for broader page-level analysis.

## Key Features & Requirements

### Input & Parsing

- A clean, user-friendly input field where users can enter a root domain or full URL for analysis.
- The system should validate the input and handle common error cases (e.g., invalid URLs).

### robots.txt Fetching and Analysis

- Implement functionality to retrieve and parse the robots.txt file of the specified site.
- Analyze the file to check if AI crawlers (as specified in this resource) are being blocked or allowed.
- Provide an overview of permissions in a user-friendly format.

### Recommendation Engine

- Based on the analysis, suggest improvements (e.g., modifying allow/disallow rules) to optimize the site for AI crawlers.
- Present recommendations clearly and concisely in the UI.

### User Interface (UI)

- Build a beautiful, responsive, accessible, and visually engaging interface
- Use React and Next.js
- Incorporate loading indicators, clear feedback on actions, and handle states such as loading, errors, and results display.

## Deliverables

### Codebase

- End-to-end implementation with clean, maintainable, and well-documented code.
- Follow best practices for accessibility, error handling, and performance.

### Documentation

- Brief documentation or README explaining the setup, architecture, and any libraries used.
- Commented code where necessary to explain logic or important considerations.

### Design and UX

- Prioritize clean, intuitive design. Focus on providing a seamless experience with minimal latency, well-structured recommendations, and clear feedback.
- Accessibility: Consider users with disabilities, ensuring the interface is navigable and readable for all.

## Evaluation Criteria

- **Technical Implementation**: Accurate parsing and interpretation of robots.txt rules, ability to fetch and parse in real-time.
- **User Experience (UX)**: Loading states, error handling, and visual feedback.
- **Design**: Clean, consistent, and user-friendly UI, with a focus on accessibility.
- **Code Quality**: Clean, modular, and maintainable code with appropriate comments and documentation.
- **Innovation**: Any added features or creative design touches that enhance the tool's usability and functionality.

Feel free to reach out with any questions, and good luck! We look forward to seeing your approach to building an impactful AEO analysis tool.
