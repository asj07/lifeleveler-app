# Project Structure (Tree)

```text
/
├── index.html                     # HTML entry mounting React and loading /src/main.tsx
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Locked dependency versions
├── bun.lockb                      # Bun lockfile (if using Bun)
├── vite.config.ts                 # Vite dev/build config
├── tailwind.config.ts             # Tailwind CSS config
├── postcss.config.js              # PostCSS/Tailwind pipeline config
├── tsconfig.json                  # Base TypeScript config
├── tsconfig.app.json              # App TypeScript config
├── tsconfig.node.json             # Node/tooling TypeScript config
├── eslint.config.js               # ESLint config
├── components.json                # shadcn-ui generator config
├── capacitor.config.ts            # Capacitor mobile build config
├── public/                        # Static assets served as-is
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── supabase/                      # Supabase project + database schema
│   ├── config.toml                # Supabase project config
│   └── migrations/                # SQL migrations (schema changes)
├── src/                           # React + TypeScript application code
│   ├── main.tsx                   # React bootstrap; renders App
│   ├── App.tsx                    # App shell, routing, theming, Supabase auth
│   ├── index.css                  # Global styles (Tailwind directives)
│   ├── App.css                    # App-level CSS
│   ├── components/                # Reusable UI and feature components
│   │   ├── ui/                    # shadcn-ui primitives and wrappers
│   │   ├── Dashboard.tsx          # Dashboard view and stats
│   │   ├── QuestList.tsx          # Quests list and controls
│   │   ├── Shop.tsx               # In-app shop UI
│   │   ├── AddQuest.tsx           # Add new quest UI
│   │   ├── HistoryView.tsx        # Historical records/timeline
│   │   ├── Header.tsx             # Application header/nav
│   │   ├── QuestTimer.tsx         # Timer for quests
│   │   └── AvatarUpload.tsx       # Avatar upload (Supabase storage)
│   ├── pages/                     # Route-level pages
│   │   ├── Auth.tsx               # Sign in/up via Supabase Auth
│   │   ├── Index.tsx              # Authenticated home experience
│   │   └── NotFound.tsx           # 404 fallback
│   ├── hooks/                     # Custom hooks for state and data
│   │   ├── useSupabaseGameState.ts# Game state synced with Supabase
│   │   ├── useGameState.ts        # Client-side game state management
│   │   ├── useHistoricalData.ts   # Fetches/structures historical data
│   │   ├── use-toast.ts           # Toast helper
│   │   └── use-mobile.tsx         # Mobile/responsive helpers
│   ├── integrations/              # Third-party integrations
│   │   └── supabase/
│   │       ├── client.ts          # Supabase client initialization
│   │       └── types.ts           # Generated DB types
│   ├── utils/                     # Domain utilities and pure logic
│   │   └── gameLogic.ts           # Core game mechanics/helpers
│   ├── lib/                       # Small shared libs
│   │   └── utils.ts               # Generic utilities
│   ├── types/                     # App-wide TS types
│   │   └── quest.ts               # Quest-related types
│   └── vite-env.d.ts              # Vite type definitions
└── README.md                      # Project overview and instructions
```

## Detailed list

- **.git/**: Git metadata for version control.
- **.gitignore**: Specifies intentionally untracked files to ignore by Git.
- **README.md**: Project overview and development/deployment instructions.
- **PROJECT_STRUCTURE.md**: High-level file/directory map with one-line descriptions (this file).
- **index.html**: HTML entry that mounts the React app and loads `/src/main.tsx`.
- **package.json**: NPM package manifest with dependencies and scripts.
- **package-lock.json**: Locked dependency versions for reproducible installs.
- **bun.lockb**: Bun lockfile (if using Bun) for deterministic dependency resolution.
- **vite.config.ts**: Vite configuration (dev server, plugins, path aliases).
- **tsconfig.json**: Base TypeScript configuration.
- **tsconfig.app.json**: TypeScript config overrides for the app build.
- **tsconfig.node.json**: TypeScript config for Node-related tooling (e.g., Vite).
- **tailwind.config.ts**: Tailwind CSS configuration (theme, content, plugins).
- **postcss.config.js**: PostCSS configuration used by Tailwind and CSS pipeline.
- **eslint.config.js**: ESLint configuration for code linting.
- **components.json**: shadcn-ui generator configuration.
- **capacitor.config.ts**: Capacitor configuration for mobile (iOS/Android) builds.
- **public/**: Static assets served as-is by Vite.
  - **favicon.ico**: Project favicon.
  - **placeholder.svg**: Placeholder SVG asset.
  - **robots.txt**: Crawler directives.
- **supabase/**: Supabase project configuration and database migrations.
  - **config.toml**: Supabase project configuration (includes project_id).
  - **migrations/**: SQL migration files defining database schema and changes.
- **src/**: Application source code (React + TypeScript).
  - **main.tsx**: React bootstrap that renders `App` into `#root`.
  - **App.tsx**: App shell with routing, theming, query client, and Supabase auth.
  - **index.css**: Global styles (Tailwind directives and base styles).
  - **App.css**: App-level CSS overrides.
  - **components/**: Reusable UI and feature components.
    - **AddQuest.tsx**: UI for adding new quests.
    - **AvatarUpload.tsx**: Component to upload and preview user avatars (uses Supabase storage).
    - **Dashboard.tsx**: Main dashboard view rendering user progress and stats.
    - **Header.tsx**: Top navigation/header component.
    - **HistoryView.tsx**: Historical timeline/records for completed activities.
    - **QuestList.tsx**: List and management UI for quests.
    - **QuestTimer.tsx**: Timer component for time-bound quests.
    - **Shop.tsx**: In-app shop UI (coins/XP items and purchases).
    - **ui/**: shadcn-ui primitives and wrappers used across the app.
  - **pages/**: Route-level pages.
    - **Auth.tsx**: Authentication page (sign in/up using Supabase Auth).
    - **Index.tsx**: Authenticated home page containing the main experience.
    - **NotFound.tsx**: 404 fallback for unknown routes.
  - **hooks/**: Custom React hooks for app state and data fetching.
    - **use-mobile.tsx**: Utility hook for mobile/responsive behavior.
    - **use-toast.ts**: Toast helper hook shared by UI.
    - **useGameState.ts**: Client-side game state management logic.
    - **useHistoricalData.ts**: Fetches and shapes historical progress data.
    - **useSupabaseGameState.ts**: Game state synced with Supabase (queries/mutations).
  - **integrations/**: Third-party service integrations.
    - **supabase/**: Supabase client and typed database schema.
      - **client.ts**: Supabase JS client initialization used throughout the app.
      - **types.ts**: Generated TypeScript types for the Supabase database.
  - **lib/**: Small library helpers.
    - **utils.ts**: Generic utilities used in multiple places.
  - **types/**: App-wide TypeScript types.
    - **quest.ts**: Type definitions related to quests.
  - **utils/**: Domain utilities and pure logic.
    - **gameLogic.ts**: Core game mechanics and calculation helpers.
  - **vite-env.d.ts**: Type definitions for Vite-specific globals.
