# Project Context: OPNEW (Tauri + React + TypeScript ERP)

## Project Overview
This project is a desktop-based Business Management / ERP application built using **Tauri**. It is designed for a textile or dyeing business, handling functions such as:
- **Sales & Returns:** Invoicing and return management.
- **Inventory:** Product management and tracking.
- **Dyeing Operations:** Managing dyeing orders and results.
- **CRM/SRM:** Customer and Supplier management.

**Tech Stack:**
- **Frontend:** React 19, TypeScript 5.8, Vite 7, Tailwind CSS (inferred from class names like `bg-purple-500`).
- **Backend:** Rust (Tauri v2).
- **Database:** SQLite (via `@tauri-apps/plugin-sql`).
- **UI Library:** Custom components, Material Symbols (likely Google Fonts).

## Building and Running

### Prerequisites
- Node.js and npm
- Rust and Cargo (for Tauri backend)
- System dependencies for Tauri (Linux/macOS/Windows specific)

### Commands
| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite dev server (frontend only) |
| `npm run tauri dev` | Start the full Tauri app in development mode (Frontend + Backend) |
| `npm run build` | Build the frontend (TypeScript + Vite) |
| `npm run tauri build` | Build the production binary (creates installer/executable) |
| `npm run preview` | Preview the production build locally |

## Development Conventions

### Architecture & State Management
- **Monolithic State:** The main application logic and global state reside in `src/App.tsx`.
- **Tab-Based Navigation:** Navigation is handled via a `renderContent` switch in `App.tsx` rather than a client-side router like `react-router`.
- **Database Initialization:** Database tables (`products`, `users`, etc.) are initialized in the `useEffect` hook within `App.tsx`.

### Frontend Guidelines (React + TS)
- **Components:** Functional components with strict TypeScript interfaces for Props.
- **Styling:** Tailwind CSS utility classes are used directly in JSX (`className="flex h-screen ..."`).
- **Naming:** PascalCase for components (`NewOrderForm`), camelCase for functions/variables.
- **Imports:** Grouped imports: React/Third-party first, then local components and types.
- **Types:** Defined in `src/types.ts` or locally within components if specific.

### Backend Guidelines (Rust)
- **Location:** All backend code is in `src-tauri/`.
- **Commands:** Expose Rust functions to the frontend using `#[tauri::command]`.
- **Database:** Use `tauri-plugin-sql` for database interactions.
- **Error Handling:** Return `Result<T, E>` to handle errors gracefully in the frontend.

### Existing Agent Guidelines
*Refer to `AGENTS.md` for granular details on:*
- TypeScript strict mode rules.
- Rust macro usage and conventions.
- Specific import styles.

## Key Files & Directories

- **`src/App.tsx`**: The core entry point containing the main layout, state management, and routing logic.
- **`src/components/`**: specific UI components (e.g., `SalesInvoicePage`, `StatCard`, `Sidebar`).
- **`src/types.ts`**: (Inferred) Likely contains shared TypeScript interfaces (`Order`, `Customer`, `Product`).
- **`src-tauri/src/lib.rs` / `main.rs`**: Rust backend entry points.
- **`src-tauri/tauri.conf.json`**: Tauri configuration (window size, permissions, bundle settings).
- **`AGENTS.md`**: Project-specific rules for AI assistants.
