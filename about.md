# LingoEdu — Full Documentation

> Comprehensive technical and product documentation for the LingoEdu platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Pages & Routes](#pages--routes)
4. [User Roles](#user-roles)
5. [Classroom System](#classroom-system)
6. [Translation Engine](#translation-engine)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Theme & Design System](#theme--design-system)
9. [Project Structure](#project-structure)
10. [Environment Variables](#environment-variables)
11. [Database Schema](#database-schema)
12. [Development Guide](#development-guide)

---

## Overview

LingoEdu is a full-featured web application designed for multilingual education environments. It connects teachers and students through virtual classrooms where learning materials can be shared and instantly translated into 100+ languages using the Lingo.dev AI translation engine.

The platform is built as a single-page application (SPA) using React 19 and Vite 7, styled with Material UI 7, and backed by Supabase for data persistence and serverless functions.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        LingoEdu SPA                          │
│                                                              │
│  ┌──────────┬─────────────────────────┬──────────────────┐   │
│  │ Sidebar  │     Main Content Area   │    User Panel    │   │
│  │ (240px)  │     (flexible width)    │     (280px)      │   │
│  │          │                         │                  │   │
│  │ Nav menu │  TopBar + Page content  │  Profile, theme  │   │
│  │          │                         │  toggle, to-do   │   │
│  └──────────┴─────────────────────────┴──────────────────┘   │
│                                                              │
│  Contexts: UserContext · ThemeContext · I18nContext            │
└──────────────────────┬───────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │      Supabase         │
           │  PostgreSQL + Edge    │
           │  Functions + Storage  │
           └───────────┬───────────┘
                       │
              ┌────────┴────────┐
              │   Lingo.dev     │
              │  Translation    │
              │     API         │
              └─────────────────┘
```

The three-column layout provides navigation (Sidebar), content (main area), and quick actions (UserPanel). On the login page, the sidebar and panel are hidden for a clean onboarding experience.

---

## Pages & Routes

| Route | Component | Access | Description |
|---|---|---|---|
| `/` | `LoginPage` | Public | Role selection & login screen |
| `/teacher` | `TeacherDashboard` | Teacher only | Upload content, manage classrooms |
| `/student` | `StudentDashboard` | Student only | Browse materials, translate content |
| `/courses` | `CoursesPage` | Authenticated | View all available study materials |
| `/calendar` | `CalendarPage` | Authenticated | Monthly calendar with activity tracking |
| `/classes` | `ClassesPage` | Authenticated | Classroom management & discovery |
| `/settings` | `SettingsPage` | Authenticated | Theme, language & account settings |

Routes are protected by `RequireUser` (role-specific) and `RequireAuth` (any authenticated user) wrapper components. Logged-in users are automatically redirected from `/` to their role-specific dashboard.

---

## User Roles

### Teacher

- Create and manage classrooms with auto-generated invite codes
- Upload content in multiple formats:
  - **Text** — Rich text entry with language tagging
  - **PDF** — Document upload
  - **Photo** — Image upload
  - **Video Link** — YouTube, Vimeo, or any URL
- View all uploaded content per classroom
- Delete classrooms and content

### Student

- Join classrooms using invite codes
- Browse all uploaded materials within joined classrooms
- Select any text and translate it to a target language
- View translation source (cached vs. fresh)
- Leave classrooms

---

## Classroom System

Classrooms are the core organizational unit in LingoEdu.

- Each classroom has a unique **code** (auto-generated uppercase string)
- Teachers create classrooms from the Teacher Dashboard or the Classes page
- Students join classrooms by entering the code
- All content (texts, files, links) is scoped to a specific classroom
- Classroom membership is stored in Supabase

**API Layer** (`classroomsApi.js`):
- `createClassroom({ name, teacher })` — Create a new classroom
- `listTeacherClassrooms(teacherName)` — List classrooms owned by a teacher
- `listJoinedClassrooms(studentName)` — List classrooms a student has joined
- `joinClassroom({ classroom_code, student_name })` — Join a classroom
- `leaveClassroom({ classroom_code, student_name })` — Leave a classroom
- `deleteClassroom(code)` — Remove a classroom
- `listAllClassrooms()` — List every classroom (for student discovery)
- `searchClassrooms(query)` — Search classrooms by name or code

---

## Translation Engine

LingoEdu uses the **Lingo.dev SDK** for AI-powered text translation.

### Flow

1. Student selects a text and a target language
2. The app checks Supabase for a cached translation (`translations` table)
3. If cached → returns immediately with `fromCache: true`
4. If not cached → calls `Lingo.dev API` → stores result in Supabase → returns with `fromCache: false`

### Configuration

- In development mode, API calls are proxied through Vite (`/api/lingo`) to avoid CORS issues
- The Vite config sets up a proxy to `https://engine.lingo.dev`
- Translation is performed via `LingoDotDevEngine.localizeText()`

### Caching

All translations are persisted in the `translations` table with:
- `text_id` — Reference to the source text
- `source_language` — Original language code
- `target_language` — Requested language code
- `translated_content` — Translated output

---

## Internationalization (i18n)

The entire LingoEdu UI supports dynamic translation through a custom i18n system.

### How It Works

1. All UI strings are defined in `DEFAULT_STRINGS` (English)
2. When the user selects a non-English locale, the system batches visible strings
3. Batches are debounced (200ms) and sent to Lingo.dev for translation
4. Translated strings are cached in Supabase and stored in React state
5. Only strings currently rendered on screen are translated (lazy loading)

### Key Design Decisions

- **Lazy batching** — Only translates keys that are actually rendered, not all ~100+ strings
- **Debounced requests** — Waits 200ms to collect all keys before making a single API call
- **Supabase cache** — Previously translated strings load instantly on subsequent visits
- **Tooltip fallback** — When UI is translated, hovering over text shows the original English

---

## Theme & Design System

### Brand Palette

| Name | Hex | Usage |
|---|---|---|
| Steel Blue | `#317BC6` | Accents, secondary actions, links |
| Indigo Velvet | `#47349D` | Primary dark variant, sidebar highlights |
| Lavender | `#CFCEE0` | Borders, subtle backgrounds, sidebar text |
| Persian Blue | `#4F3CAF` | Primary brand color, buttons, active states |
| Deep Twilight | `#16195E` | Sidebar background, heading text |

### Theme Modes

- **Light mode** — White/lavender backgrounds, deep twilight text
- **Dark mode** — Deep navy backgrounds, light lavender text
- Toggle persisted in `localStorage`

### Component Customizations

- Cards use `backdrop-filter: blur(12px)` for a frosted-glass effect
- Buttons have `textTransform: none` for natural casing
- Border radius is set to `8px` globally, `12px` for cards
- Typography uses the **Inter** font family

### Animations

- `fadeIn` — Page entry animation (0.4s ease-out)
- `slideUp` — Card entry animation (0.45s ease-out)
- `float` — Login page background animation (8s infinite alternate)

---

## Project Structure

```
src/
├── assets/
│   ├── logo.png              # Square logo mark
│   ├── logo full.png         # Full logo with text
│   └── react.svg
├── components/
│   ├── AppLayout.jsx          # Three-column layout shell
│   ├── Sidebar.jsx            # Left navigation with branding
│   ├── TopBar.jsx             # Page header with search
│   └── UserPanel.jsx          # Right panel (profile, theme, todo)
├── context/
│   ├── I18nContext.jsx        # Internationalization provider
│   ├── ThemeContext.jsx       # Dark/light mode state
│   └── UserContext.jsx        # User authentication state
├── lib/
│   ├── classroomsApi.js       # Supabase classroom operations
│   ├── languages.js           # Supported language definitions
│   ├── supabaseClient.js      # Supabase client initialization
│   ├── textsApi.js            # Supabase text CRUD operations
│   └── translationApi.js      # Lingo.dev translation + caching
├── pages/
│   ├── CalendarPage.jsx       # Monthly calendar with activity overlay
│   ├── ClassesPage.jsx        # Classroom management & discovery
│   ├── CoursesPage.jsx        # Browse all study materials
│   ├── LoginPage.jsx          # Onboarding & role selection
│   ├── NotesPage.jsx          # Notes (placeholder)
│   ├── SettingsPage.jsx       # User preferences
│   ├── StudentDashboard.jsx   # Student home with translation tools
│   └── TeacherDashboard.jsx   # Teacher home with content upload
├── App.jsx                    # Root: theme, routes, providers
├── App.css                    # Minimal global overrides
├── index.css                  # Fonts, scrollbar, animations
└── main.jsx                   # React DOM entry point
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_LINGO_API_KEY` | Yes | Lingo.dev API key for translations |

---

## Database Schema

### `classrooms`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `code` | text | Unique classroom invite code |
| `name` | text | Classroom display name |
| `teacher` | text | Teacher's display name |
| `created_at` | timestamp | Creation timestamp |

### `classroom_members`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `classroom_code` | text | FK to classrooms.code |
| `student_name` | text | Student's display name |
| `joined_at` | timestamp | Join timestamp |

### `texts`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `title` | text | Content title |
| `content` | text | Full text content |
| `language` | text | Source language code |
| `classroom_code` | text | FK to classrooms.code |
| `created_by` | text | Author's display name |
| `created_at` | timestamp | Creation timestamp |

### `translations`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `text_id` | uuid | FK to texts.id |
| `source_language` | text | Original language code |
| `target_language` | text | Translated language code |
| `translated_content` | text | Translated text output |
| `created_at` | timestamp | Translation timestamp |

---

## Development Guide

### Local Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

### Adding a New Page

1. Create a component in `src/pages/`
2. Add i18n strings to `DEFAULT_STRINGS` in `I18nContext.jsx`
3. Add a route in `App.jsx` inside `<Routes>`
4. Add navigation entry in `Sidebar.jsx`

### Adding i18n Strings

1. Add the English string to `DEFAULT_STRINGS` in `src/context/I18nContext.jsx`
2. Use `const { t } = useI18n()` in your component
3. Reference the key: `t('section.keyName')`
4. Translations happen automatically when the user switches languages
