# AGENTS.md

This file contains guidelines for agentic coding assistants working on this Tauri + React + TypeScript project.

## Project Overview

This is a Tauri desktop application with a React frontend and Rust backend. The app uses:
- Frontend: React 19, TypeScript 5.8, Vite 7
- Backend: Rust, Tauri 2
- Database: SQLite via tauri-plugin-sql

## Build Commands

```bash
# Development
npm run dev                # Start Vite dev server on port 1420
npm run tauri dev         # Start full Tauri development (frontend + backend)

# Building
npm run build              # Build frontend (TypeScript + Vite)
npm run tauri build        # Build complete Tauri app (creates production binary)

# Preview
npm run preview            # Preview production build locally

# Tauri CLI
npm run tauri <command>    # Run any Tauri CLI command
```

## Testing Commands

No test framework is currently configured. If adding tests:
- Install a testing framework (Jest, Vitest, React Testing Library)
- Add test scripts to package.json
- Follow TypeScript strict mode for test files

## TypeScript Configuration

- Strict mode enabled (`strict: true`)
- Unused locals and parameters trigger errors
- No fallthrough cases in switch statements
- ES2020 target with ESNext modules
- Bundler module resolution
- JSX transform: `react-jsx`
- `skipLibCheck: true` for faster builds

## React Guidelines

- Use functional components with hooks
- Define components as named functions (e.g., `function App() {}`)
- Use `useState`, `useEffect`, and other hooks from React
- Prefer explicit typing for props and state
- Use `className` instead of `class` for CSS classes
- Always export components using `export default`
- Async functions for Tauri command invocations

## Import Style

- Use ES6 imports for all dependencies
- Import React explicitly: `import React from "react";`
- Third-party imports: `import { invoke } from "@tauri-apps/api/core";`
- Local imports use relative paths: `import "./App.css";` or `import reactLogo from "./assets/react.svg";`
- Import type dependencies separately if needed for performance
- Keep imports at top of file, grouped: external → local

## Rust Backend Guidelines

- Function names use `snake_case`
- Use `#[tauri::command]` macro for functions exposed to frontend
- Commands accept `&str` or structured types as parameters
- Return `String`, `Result<T, E>`, or serializable types
- Use `#[cfg_attr(mobile, tauri::mobile_entry_point)]` for mobile compatibility
- Register commands with `tauri::generate_handler![command_name]`
- Use `#[derive(serde::Serialize, serde::Deserialize)]` for data structures passed between Rust and JS
- Error messages should be descriptive and user-friendly
- Keep logic in lib.rs, main.rs only calls `opnew_lib::run()`

## Type Safety

- Always define types for props interfaces
- Use TypeScript's type inference when obvious
- Avoid `any` type - use `unknown` or `Record<string, unknown>` for truly dynamic data
- Use `as HTMLElement` for DOM element type assertions when necessary
- Leverage `@types` packages for third-party libraries

## Error Handling

- Rust: Return `Result<T, E>` for operations that may fail
- React/TS: Use try/catch for async operations with Tauri commands
- Display user-friendly error messages in UI
- Log errors to console for debugging
- Handle edge cases (empty inputs, null values)

## File Organization

- Frontend source in `src/`
- Rust source in `src-tauri/src/`
- Static assets in `src/assets/` or `public/`
- Build output to `dist/` (frontend) and `target/` (Rust)
- Component-specific CSS files co-located with components

## CSS Guidelines

- Use regular CSS files with className bindings
- Define global styles in `:root` and media queries
- Support dark mode using `@media (prefers-colorscheme: dark)`
- Use standard CSS properties and values
- Class names use kebab-case: `.logo-container`, `.greet-input`

## Tauri Command Invocation

- Use `invoke("command_name", { param: value })` to call Rust functions
- Commands are registered in Rust with `#[tauri::command]`
- Pass parameters as an object (not separate arguments)
- Results are typed - cast if necessary
- Async/await for all command invocations

## Vite Configuration

- Development server: `http://localhost:1420`
- HMR port: 1421
- Ignores `src-tauri` directory for file watching
- Uses `@vitejs/plugin-react` for React support
- Clear screen disabled to see Rust errors
- Strict port enforcement (fails if port in use)

## Code Formatting

- No Prettier or ESLint configured currently
- Follow existing code patterns when adding code
- Maintain consistent indentation (2 spaces or tabs based on file)
- Use meaningful variable/function names
- Keep lines reasonably long but readable
- Add blank lines between logical sections
