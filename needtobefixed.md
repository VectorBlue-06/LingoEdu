# LingoEdu (text-bridge) — Comprehensive Codebase Audit

> Generated: 2026-02-22  
> Scope: Full application — React frontend, Supabase backend, i18n system, auth, classroom/course system

---

## Table of Contents

1. [Critical Bugs & Failures](#1-critical-bugs--failures)
2. [Security Vulnerabilities](#2-security-vulnerabilities)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Data Integrity & Validation](#4-data-integrity--validation)
5. [API & Network Failure Handling](#5-api--network-failure-handling)
6. [Performance Issues](#6-performance-issues)
7. [Missing Educational Features](#7-missing-educational-features)
8. [UX & Accessibility Issues](#8-ux--accessibility-issues)
9. [Architecture & Code Quality](#9-architecture--code-quality)
10. [Classroom/Course System Gaps](#10-classroomcourse-system-gaps)
11. [i18n System Issues](#11-i18n-system-issues)
12. [Build, DevOps & Infrastructure](#12-build-devops--infrastructure)

---

## 1. Critical Bugs & Failures

### 1.1 — Supabase client created with `undefined` credentials
**File:** `src/lib/supabaseClient.js` · Lines 3-4  
**Issue:** If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing, the code only logs a `console.warn` but still calls `createClient(undefined, undefined)`. This throws a runtime error inside `@supabase/supabase-js` and crashes the entire app.  
**Fix:** Guard with a fallback or throw a clear error before calling `createClient`.

### 1.2 — Classroom code collisions (`generateCode`)
**File:** `src/lib/classroomsApi.js` · Lines 3-5  
**Issue:** `Math.random().toString(36).substring(2, 8)` generates a 6-char alphanumeric code with no uniqueness check. With ~2 billion possible codes, collisions are unlikely at small scale but **guaranteed** at scale. A duplicate code would cause a Supabase INSERT to fail or silently allow two classrooms with the same code, breaking joins.  
**Fix:** Use `crypto.randomUUID()` or add a unique constraint + retry loop.

### 1.3 — Memory leak: `URL.createObjectURL` never revoked
**File:** `src/pages/TeacherDashboard.jsx` · Line ~285 (Photo tab)  
**Issue:** `URL.createObjectURL(selectedFile)` is called inline in JSX for image previews. The object URL is never revoked with `URL.revokeObjectURL()`, leaking blob memory on every file selection.  
**Fix:** Store the object URL in state and revoke on cleanup or when a new file is selected.

### 1.4 — File upload is a no-op (fake implementation)
**File:** `src/pages/TeacherDashboard.jsx` · Lines 126-137 (`handleFileUpload`)  
**Issue:** The PDF and Photo upload handlers do nothing — `handleFileUpload` just sets a success message and clears state. No file is actually uploaded to Supabase Storage or any backend. Users believe files are uploaded but they aren't.  
**Fix:** Implement actual file upload to Supabase Storage and associate files with classrooms/texts.

### 1.5 — Video link is discarded
**File:** `src/pages/TeacherDashboard.jsx` · Lines 139-146 (`handleAddVideo`)  
**Issue:** The video URL and title are validated and cleared with a success message, but the data is never persisted anywhere. It vanishes on page refresh.  
**Fix:** Store video links in the database, linked to a classroom.

### 1.6 — Race condition: stale locale in i18n batch translation
**File:** `src/context/I18nContext.jsx` · Lines 218-260 (`flush`)  
**Issue:** While the locale check `if (localeRef.current !== lang) return` exists, the `setTranslated` callback merges into the previous locale's state on the same `useState`. If a user rapidly switches locales, old translations can bleed into the new locale's dictionary because `setTranslated(prev => ...)` still runs against stale `prev`.  
**Fix:** Abort in-flight requests using `AbortController`, or key the translated state by locale.

### 1.7 — I18n translation splitting breaks on multiline content
**File:** `src/context/I18nContext.jsx` · Lines 245-250  
**Issue:** Translation values are joined with `\n` and later split with `result.split('\n')`. If any translated string itself contains a newline, the split produces more elements than keys, misaligning all subsequent translations.  
**Fix:** Use a unique delimiter (e.g. `\n---DELIM---\n`) or translate strings individually / as a JSON object.

### 1.8 — `searchClassrooms` vulnerable to Supabase query injection
**File:** `src/lib/classroomsApi.js` · Lines 47-57  
**Issue:** The search query is interpolated directly into `.or(...)`:  
```js
.or(`code.eq.${q.toUpperCase()},name.ilike.%${q}%`)
```
If `q` contains commas or `.` operators (e.g. `foo,name.eq.admin`), it can break or manipulate the query filter. This is a **PostgREST filter injection**.  
**Fix:** Use separate `.eq()` / `.ilike()` calls, or sanitize input to strip PostgREST operators.

---

## 2. Security Vulnerabilities

### 2.1 — No real authentication
**File:** `src/context/UserContext.jsx` · Entire file  
**Issue:** "Login" only stores `{ name, role }` in localStorage. There is:
- No password verification
- No email address collected or validated
- No Supabase Auth integration
- No JWT/session tokens
- Anyone can type any name and select "teacher" to get teacher access  
**Impact:** Any user can impersonate any other user (including teachers) by simply entering their name.

### 2.2 — Supabase anon key exposed in client bundle
**File:** `src/lib/supabaseClient.js` · Lines 3-4, also `vite.config.js`  
**Issue:** `VITE_SUPABASE_ANON_KEY` is embedded in the JS bundle. While this is expected for Supabase, the app likely has **no Row Level Security (RLS)** policies since there's no real auth. Combined with the anon key, any user can directly call Supabase APIs to:
- Read all classrooms and all texts
- Delete other teachers' classrooms
- Insert texts into any classroom
- Delete/modify any data  
**Fix:** Implement Supabase Auth + RLS policies on all tables.

### 2.3 — Translation API key in client bundle
**File:** `src/lib/translationApi.js` · Line 4, `src/context/I18nContext.jsx` · Line 233  
**Issue:** `VITE_LINGO_API_KEY` is exposed in the client-side bundle. Any user can extract it from browser DevTools and use it for unlimited API calls, billing to the project owner.  
**Fix:** Proxy all translation requests through a backend/serverless function.

### 2.4 — No input sanitization / XSS risk
**Files:** `src/pages/TeacherDashboard.jsx`, `src/pages/StudentDashboard.jsx`  
**Issue:** Text content from the database is rendered directly. While React escapes JSX by default, the `title` attributes and any future `dangerouslySetInnerHTML` usage would be vulnerable. More critically, stored text content in Supabase is not sanitized — if a future feature renders HTML/Markdown, stored XSS becomes possible.  
**Fix:** Sanitize all user inputs server-side; add CSP headers.

### 2.5 — `navigator.clipboard.writeText` without HTTPS check
**Files:** `src/pages/TeacherDashboard.jsx` · Line 157, `src/pages/ClassesPage.jsx` · Line 96  
**Issue:** `navigator.clipboard.writeText(code)` fails silently on HTTP (non-secure contexts) and on older browsers. No error handling or fallback.  
**Fix:** Add try/catch with a fallback (e.g., `document.execCommand('copy')`) and user feedback.

### 2.6 — No CSRF protection
**Issue:** Since there's no auth, there's no session to protect. But when auth is added, all state-changing Supabase calls will need CSRF tokens or rely on Supabase's JWT-based auth model.

---

## 3. Authentication & Authorization

### 3.1 — Role spoofing
**File:** `src/context/UserContext.jsx` · Line 33  
**Issue:** `login({ name, role })` accepts role directly from user input. A student can select "teacher" and gain full teacher access. No server-side role verification.

### 3.2 — Name-based identity system
**Files:** `src/lib/classroomsApi.js` (all functions using `teacher_name`, `student_name`)  
**Issue:** The entire identity model is based on plain-text names:
- `teacher_name` for classroom ownership
- `student_name` for membership  
Two users named "John" would share classrooms, to-do items, and data. Name changes break all associations.

### 3.3 — No session expiration
**File:** `src/context/UserContext.jsx` · Lines 9-15  
**Issue:** The user object persists in localStorage indefinitely with no expiration, invalidation, or session management.

### 3.4 — No logout cleanup
**File:** `src/context/UserContext.jsx` · Line 34  
**Issue:** `logout` only clears the user state. Sensitive data (translations, todo items, theme preferences) remain in localStorage.

### 3.5 — Route guards are client-side only
**File:** `src/App.jsx` · Lines 105-120 (`RequireUser`, `RequireAuth`)  
**Issue:** All access control is pure client-side navigation guards. A user can directly call Supabase APIs without any server-side authorization check.

---

## 4. Data Integrity & Validation

### 4.1 — No input length limits
**Files:** `src/pages/TeacherDashboard.jsx` (text content), `src/pages/ClassesPage.jsx` (classroom names)  
**Issue:** No maxLength on any text field. A user could submit a 10MB text blob, a 10K-character classroom name, or an extremely long to-do item, causing performance issues and potential database errors.

### 4.2 — No content type validation for file uploads
**File:** `src/pages/TeacherDashboard.jsx` · Lines 108-113  
**Issue:** While the `accept` attribute hints at file types, there's no validation that the selected file actually matches (MIME type spoofing is trivial). Since uploads aren't implemented, this is moot for now but will matter when fixed.

### 4.3 — Classroom deletion doesn't cascade
**File:** `src/lib/classroomsApi.js` · Lines 37-42 (`deleteClassroom`)  
**Issue:** Deleting a classroom only deletes the `classrooms` row. Related `classroom_members` and `texts` rows referencing that classroom's code are orphaned.  
**Fix:** Add `ON DELETE CASCADE` in Supabase or manually delete related records.

### 4.4 — No duplicate classroom name prevention
**File:** `src/lib/classroomsApi.js` · Lines 9-17 (`createClassroom`)  
**Issue:** A teacher can create 100 classrooms with the same name, leading to confusion.

### 4.5 — Translation cache can serve stale data
**File:** `src/lib/translationApi.js` · Lines 23-34  
**Issue:** Once a translation is cached, it's returned forever — even if the source text content is updated. There's no cache invalidation mechanism.

### 4.6 — No optimistic locking / concurrent edit handling
**Issue:** If two teachers manage the same classroom simultaneously (e.g., both deleting), race conditions can cause errors or inconsistent state without user feedback.

---

## 5. API & Network Failure Handling

### 5.1 — No retry logic on any API call
**Files:** All files in `src/lib/`  
**Issue:** Every Supabase call and translation API call fails permanently on the first error. Transient network failures (timeouts, 502s) are not retried.

### 5.2 — No request cancellation on unmount
**Files:** `src/pages/TeacherDashboard.jsx`, `src/pages/StudentDashboard.jsx`, `src/pages/CalendarPage.jsx`, `src/pages/ClassesPage.jsx`, `src/pages/CoursesPage.jsx`  
**Issue:** All `useEffect` hooks that make async calls don't return cleanup functions. If a component unmounts while a request is in flight, calling `setState` on the unmounted component causes a React warning (React 18+) and potential memory leaks.  
**Fix:** Use `AbortController` or a `cancelled` flag in the cleanup function.

### 5.3 — No offline detection or handling
**Issue:** The app makes no attempt to detect offline status. All network calls fail silently or with generic error messages. No "You are offline" indicator.

### 5.4 — No loading states for classroom creation/deletion
**File:** `src/pages/TeacherDashboard.jsx` · Lines 149-165  
**Issue:** `handleCreateClassroom` and `handleDeleteClassroom` don't set any loading state. The user can click multiple times, creating duplicate classrooms or sending multiple delete requests.

### 5.5 — Errors silently swallowed
**Files:** All pages  
**Issue:** Many `catch` blocks only `console.error` without showing user-facing feedback. Examples:
- `loadTextsForClassroom` (TeacherDashboard L87)
- `handleLeaveClassroom` (StudentDashboard L87)
- `handleDeleteClass` (ClassesPage L86)
- Failed join in CalendarPage (there's no error state at all)

### 5.6 — `CoursesPage` loads ALL texts from ALL classrooms
**File:** `src/pages/CoursesPage.jsx` · Lines 18-27  
**Issue:** `listTexts()` is called with no classroom filter, fetching every text in the database. No pagination, no filtering, no limit. This will break at scale and potentially exposes texts from classrooms the user hasn't joined.

---

## 6. Performance Issues

### 6.1 — N+1 query in CalendarPage
**File:** `src/pages/CalendarPage.jsx` · Lines 68-82  
**Issue:** For each classroom, a separate `listTexts(room.code)` call is made sequentially in a `for...of` loop. With 20 classrooms, this fires 20 sequential Supabase queries.  
**Fix:** Fetch all texts in one query using `.in('classroom_code', codes)`.

### 6.2 — No pagination anywhere
**Files:** All list views  
**Issue:** `listTexts`, `listTeacherClassrooms`, `listAllClassrooms`, `listJoinedClassrooms` all fetch **every** record. With thousands of texts or classrooms, this causes:
- Slow page loads
- High memory usage
- Supabase transfer limits exceeded

### 6.3 — No virtualization for long lists
**Files:** `src/pages/TeacherDashboard.jsx`, `src/pages/StudentDashboard.jsx`, `src/pages/ClassesPage.jsx`  
**Issue:** All lists render every item in the DOM. With 500+ texts or classrooms, this causes janky scrolling and high memory usage.  
**Fix:** Use `react-window` or `react-virtuoso` for large lists.

### 6.4 — I18n `t()` function triggers re-renders on every translation batch
**File:** `src/context/I18nContext.jsx` · Lines 303-330  
**Issue:** `t()` is in a `useCallback` with `[locale, translated, flush]` dependencies. Every time `translated` state updates (after a batch), all components that call `t()` re-render, even if their specific keys didn't change.  
**Fix:** Use a ref-based approach or memoize individual keys.

### 6.5 — MUI theme recreated on every mode change
**File:** `src/App.jsx` · Line 195  
**Issue:** `useMemo(() => getTheme(mode), [mode])` recreates the entire theme object on toggle, which is correct but could be precomputed as two static theme objects.

### 6.6 — `listJoinedClassrooms` does two queries (N+1)
**File:** `src/lib/classroomsApi.js` · Lines 102-119  
**Issue:** First fetches `classroom_code` from `classroom_members`, then fetches classroom objects using `.in('code', codes)`. This could be a single query using a Supabase join/view.

### 6.7 — UserPanel re-renders entire todo list on every keystroke
**File:** `src/components/UserPanel.jsx` · Lines 84-92  
**Issue:** `newTodo` state change re-renders the entire component including the todo list. The todo list should be a separate memoized component.

### 6.8 — TopBar search field is non-functional
**File:** `src/components/TopBar.jsx` · Entire file  
**Issue:** The search `TextField` has no `onChange`, `value`, or `onSubmit`. It's purely decorative — a user types into it and nothing happens.

---

## 7. Missing Educational Features

### 7.1 — No grades or grading system
**Impact:** Teachers cannot assess student work. There's no concept of assignments, submissions, or scoring.

### 7.2 — No assignments or homework
**Impact:** Teachers can only upload texts. They cannot create assignments with due dates, instructions, or submission requirements.

### 7.3 — No quizzes or assessments
**Impact:** No way to test student comprehension of translated texts — a core need for language learning.

### 7.4 — No attendance tracking
**Impact:** No way to know which students are active, when they last logged in, or if they've engaged with content.

### 7.5 — No messaging or communication
**Impact:** Teachers and students cannot communicate within the platform. No announcements, direct messages, or discussion boards.

### 7.6 — No notifications system
**Impact:** Students don't know when new content is uploaded. Teachers don't know when students join.

### 7.7 — No file management
**Impact:** File uploads are fake (see Bug 1.4). Even when implemented, there's no file organization, versioning, or download management.

### 7.8 — No progress tracking
**Impact:** No way to track which texts a student has read, which translations they've done, or learning progress over time.

### 7.9 — No student enrollment verification
**Impact:** Any person can join any classroom with just the code. No teacher approval workflow.

### 7.10 — No content organization within classrooms
**Impact:** Texts in a classroom are just a flat list. No folders, modules, units, or curriculum structure.

### 7.11 — No student profiles or portfolios
**Impact:** Students have no profile page, saved translations, or learning history.

### 7.12 — No analytics or reporting
**Impact:** Teachers cannot see classroom engagement metrics, popular texts, or translation patterns.

### 7.13 — No calendar events / scheduling
**File:** `src/pages/CalendarPage.jsx`  
**Impact:** The calendar only shows text creation dates. Teachers cannot schedule classes, set deadlines, or create events.

### 7.14 — No text editing or versioning
**File:** `src/pages/TeacherDashboard.jsx`  
**Impact:** Once a text is uploaded, it cannot be edited or updated. No version history.

### 7.15 — No text deletion capability
**File:** `src/lib/textsApi.js`  
**Impact:** There's no `deleteText` function. Teachers cannot remove content they've uploaded.

---

## 8. UX & Accessibility Issues

### 8.1 — No error boundary
**File:** `src/App.jsx`  
**Issue:** No React Error Boundary wraps the app. A single component crash (e.g., invalid date, null access) shows a white screen instead of a graceful fallback.

### 8.2 — No 404 page
**File:** `src/App.jsx` · Line 184  
**Issue:** Unknown routes redirect to `/` silently. Users get no feedback that they hit a wrong URL.

### 8.3 — Sidebar is not responsive (no mobile support)
**File:** `src/components/Sidebar.jsx`  
**Issue:** The `Drawer` is `variant="permanent"` with a fixed 240px width. On mobile:
- It takes up the entire screen width
- There's no hamburger menu toggle
- The UserPanel (280px) plus Sidebar (240px) = 520px of chrome, leaving no room for content on small screens

### 8.4 — UserPanel not collapsible on mobile
**File:** `src/components/UserPanel.jsx`  
**Issue:** The panel is always rendered at 280px wide (or 48px collapsed). On mobile, this competes with the sidebar for space.

### 8.5 — No confirmation dialogs for destructive actions
**Files:** `src/pages/TeacherDashboard.jsx` (delete classroom), `src/pages/ClassesPage.jsx` (delete class), `src/pages/StudentDashboard.jsx` (leave classroom)  
**Issue:** Clicking delete or leave immediately performs the action with no "Are you sure?" dialog.

### 8.6 — Missing ARIA labels
**Files:** All components  
**Issue:** Interactive elements lack `aria-label`, `aria-describedby`, and `role` attributes:
- Icon buttons (copy, delete, edit) have tooltips but no ARIA labels
- The calendar table has no ARIA attributes for screen readers
- Form fields lack proper `aria-required` or `aria-invalid`

### 8.7 — No keyboard navigation for calendar
**File:** `src/pages/CalendarPage.jsx`  
**Issue:** Calendar day cells are read-only `<td>` elements with no keyboard focus, tabindex, or key handlers.

### 8.8 — No focus management on navigation
**Issue:** When navigating between pages, focus doesn't move to the main content area. Screen reader users must Tab through the entire sidebar/panel again.

### 8.9 — Color contrast issues
**File:** `src/pages/CalendarPage.jsx` · Lines ~260-270  
**Issue:** Small event text on calendar cells uses `fontSize: 10` with potentially low contrast colors.  
**File:** `src/pages/LoginPage.jsx` · Multiple locations  
**Issue:** Hardcoded colors like `color: '#555770'` may not meet WCAG AA contrast requirements against all background colors.

### 8.10 — Success/error alerts auto-dismiss not implemented
**Files:** `TeacherDashboard.jsx`, `ClassesPage.jsx`, `StudentDashboard.jsx`  
**Issue:** Alert messages persist until manually dismissed. They should auto-dismiss after a timeout.

### 8.11 — No loading skeleton screens
**Files:** All pages  
**Issue:** Loading states show a centered `CircularProgress` spinner. Skeleton screens would provide better perceived performance.

### 8.12 — No empty state illustrations
**Issue:** Empty states show plain text ("No classes yet"). Illustrated empty states with clear CTAs improve engagement.

### 8.13 — Login page doesn't work on mobile
**File:** `src/pages/LoginPage.jsx` · Line 150  
**Issue:** The left illustration column has `display: { xs: 'none', md: 'flex' }`, which is correct, but the form card uses `maxWidth: 820` which may overflow on very small screens.

### 8.14 — RTL language support missing
**File:** `src/lib/languages.js`, `src/App.jsx`  
**Issue:** Arabic, Hebrew, Urdu, Persian are offered as interface languages, but the app has no `dir="rtl"` support. The sidebar, layout, and text alignment will be broken for RTL users.

### 8.15 — No "Back to top" or scroll restoration
**Issue:** Long pages (many classroom texts) require manual scrolling back up. No scroll-to-top button or scroll position restoration on navigation.

---

## 9. Architecture & Code Quality

### 9.1 — No testing whatsoever
**File:** `package.json`  
**Issue:** No test framework installed (no Jest, Vitest, React Testing Library, Cypress, Playwright). Zero test coverage.

### 9.2 — No TypeScript
**File:** `package.json`  
**Issue:** Entire codebase is JavaScript with no type checking. `@types/react` and `@types/react-dom` are installed but unused (no `.ts`/`.tsx` files). Type-related bugs can go undetected.

### 9.3 — Monolithic page components
**Files:** `src/pages/TeacherDashboard.jsx` (~310 lines), `src/pages/StudentDashboard.jsx` (~310 lines), `src/pages/CalendarPage.jsx` (~375 lines)  
**Issue:** These files contain all UI, state management, and logic in a single component. Should be decomposed into smaller components with custom hooks for data fetching.

### 9.4 — No state management library
**Issue:** All state is managed via `useState` in individual components. Shared state (e.g., classroom data) is fetched independently by `TeacherDashboard`, `ClassesPage`, and `CalendarPage`, causing redundant API calls.  
**Fix:** Consider React Query / TanStack Query for server state, or a global store for shared data.

### 9.5 — Inconsistent error handling patterns
**Issue:** Some functions throw errors (API layer), some catch and `console.error` (pages), some show alerts, some do nothing. No consistent pattern.

### 9.6 — UserContext inside I18nProvider inside BrowserRouter
**File:** `src/App.jsx` · Lines 200-210  
**Issue:** `UserProvider` is nested inside `I18nProvider` and `BrowserRouter`. This means `I18nProvider` cannot access user context (e.g., to load user-specific language preference). The provider order may need to be reconsidered.

### 9.7 — Prop drilling for common data
**Issue:** `user` is accessed via `useUser()` in almost every component. While context avoids prop drilling, it causes all consuming components to re-render when user changes.

### 9.8 — No environment validation
**File:** `src/lib/supabaseClient.js`  
**Issue:** No `.env.example` file documenting required environment variables. No build-time validation that all required env vars are present.

### 9.9 — `NotesPage.jsx` exists but is unused
**File:** `src/pages/NotesPage.jsx`  
**Issue:** Listed in the workspace structure but never imported or routed to.

---

## 10. Classroom/Course System Gaps

### 10.1 — No student roster visibility
**Issue:** Teachers cannot see which students have joined their classrooms, or how many members exist in each classroom.

### 10.2 — No classroom settings or customization
**Issue:** Classrooms are just a name + code. No description, schedule, language focus, level, capacity limit, or cover image.

### 10.3 — No classroom archiving
**Issue:** Classrooms can only be deleted, not archived. Deleting loses all associated content.

### 10.4 — No content ordering or pinning
**Issue:** Texts are always ordered by `created_at DESC`. Teachers can't reorder, pin important texts, or group them into units.

### 10.5 — No collaborative features
**Issue:** No shared annotations, comments on texts, peer translations, or group activities.

### 10.6 — No teacher-to-teacher collaboration
**Issue:** Classrooms are owned by a single teacher (identified by name). No co-teacher or teaching assistant support.

### 10.7 — No classroom invitation system
**Issue:** Sharing is only via 6-char code. No email invitations, QR codes, or shareable links.

### 10.8 — Students can access all classrooms via AllClassrooms list
**File:** `src/pages/ClassesPage.jsx` · Line 66  
**Issue:** `listAllClassrooms()` fetches every classroom in the database, letting students browse and join any class. There's no concept of private/public classrooms.

### 10.9 — No kick/remove student capability
**Issue:** Teachers cannot remove a student from their classroom. Only students can leave voluntarily.

### 10.10 — No classroom member count
**Issue:** Neither the classroom list nor the classroom cards show how many students are enrolled.

---

## 11. i18n System Issues

### 11.1 — Translation batch uses newline splitting (see Bug 1.7)
Already documented above but critical enough to mention again.

### 11.2 — No fallback locale chain
**File:** `src/context/I18nContext.jsx`  
**Issue:** If a translation fails, it falls back directly to English. There's no intermediate fallback (e.g., `pt-BR` → `pt` → `en`).

### 11.3 — Non-UI strings not translated
**Issue:** Error messages, console warnings, hardcoded strings like `"Could not join classroom. Check the code and try again."` and `"+{n} more"` on the calendar are in English only.

### 11.4 — Translated strings not escaped for special characters
**File:** `src/context/I18nContext.jsx`  
**Issue:** If a translation contains `{`, `}`, `<`, or `>`, it could break JSX rendering in future template-based i18n.

### 11.5 — Two-letter language codes insufficient
**File:** `src/lib/languages.js`  
**Issue:** Some languages (e.g., `zh` vs `zh-TW`) need region codes. The language list includes `zh-TW` but the API and cache may not handle hyphenated codes consistently.

### 11.6 — UI translation count is unbounded
**File:** `src/context/I18nContext.jsx`  
**Issue:** The `ui_translations` table stores a single JSON column `translations` per language. As more keys are added, this JSON blob grows unboundedly and is loaded in full on every locale change.

### 11.7 — Calendar weekday names not translated
**File:** `src/pages/CalendarPage.jsx` · Line 21  
**Issue:** `const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']` is hardcoded in English. Should use `Intl.DateTimeFormat` or i18n keys.

### 11.8 — Month name locale-unaware
**File:** `src/pages/CalendarPage.jsx` · Line 101  
**Issue:** `toLocaleString('default', { month: 'long' })` uses the browser's default locale, not the app's selected locale.

---

## 12. Build, DevOps & Infrastructure

### 12.1 — No CI/CD pipeline
**Issue:** No GitHub Actions, CircleCI, or any CI configuration. No automated builds, tests, or deployments.

### 12.2 — No `.env.example` file
**Issue:** New developers won't know which environment variables are needed (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_LINGO_API_KEY`).

### 12.3 — No production error tracking
**Issue:** No Sentry, LogRocket, or any error monitoring. Production errors are invisible.

### 12.4 — No analytics
**Issue:** No usage tracking, feature adoption metrics, or user behavior analytics.

### 12.5 — Vite proxy only works in development
**File:** `vite.config.js` · Lines 8-14  
**Issue:** The `/api/lingo` proxy that avoids CORS is dev-only. In production, translation API calls will hit CORS errors unless:
- The Lingo.dev API allows the production origin, OR
- A production proxy/serverless function is deployed
  
This is not documented or addressed.

### 12.6 — No PWA support
**Issue:** For an education platform, offline support (PWA with service workers) would be valuable for areas with poor connectivity, but none is implemented.

### 12.7 — No Docker / containerization
**Issue:** No `Dockerfile` or `docker-compose.yml` for consistent development environments.

### 12.8 — No database migrations or schema documentation
**Issue:** The Supabase schema (tables: `classrooms`, `classroom_members`, `texts`, `translations`, `ui_translations`) is not documented. No migration files, no schema diagram.

---

## Summary Priority Matrix

| Priority | Category | Count |
|----------|----------|-------|
| 🔴 Critical | Security (no auth, exposed keys, query injection) | 6 |
| 🔴 Critical | Fake features (file upload, video links) | 2 |
| 🟠 High | Data integrity (cascading deletes, code collisions, stale cache) | 6 |
| 🟠 High | Network handling (no retries, no cancellation, no offline) | 6 |
| 🟡 Medium | Performance (N+1, no pagination, no virtualization) | 8 |
| 🟡 Medium | UX/A11y (no error boundary, no mobile, no ARIA, no RTL) | 15 |
| 🔵 Low | Missing educational features | 15 |
| 🔵 Low | Architecture & code quality | 9 |
| ⚪ Future | Build/DevOps/Infrastructure | 8 |
| **Total** | | **75** |

---

## Recommended Fix Order

1. **Implement real authentication** (Supabase Auth) — blocks everything
2. **Add RLS policies** to all Supabase tables
3. **Move API keys to server-side** (Edge Functions or proxy)
4. **Fix the Supabase client crash** when env vars are missing
5. **Fix i18n newline splitting** bug
6. **Sanitize PostgREST filter inputs** in `searchClassrooms`
7. **Add Error Boundaries** and proper error handling
8. **Make the sidebar responsive** (mobile hamburger menu)
9. **Implement actual file upload** to Supabase Storage
10. **Add pagination** to all list queries
11. **Add request cancellation** on component unmount
12. **Add confirmation dialogs** for destructive actions
13. **Fix cascade deletes** for classroom deletion
14. **Add testing infrastructure** (Vitest + React Testing Library)
15. **Implement missing educational features** (assignments, grades, progress)
