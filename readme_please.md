# Text-Bridge UI – Quick Reference

## What Is This?
A teacher-student platform where teachers upload text data and students access it. Built with **React + Vite + Material UI + Supabase**.

## Layout (3-Column)
```
┌──────────┬────────────────────────┬──────────┐
│ Sidebar  │    Main Content Area   │  User    │
│ (240px)  │    (flexible width)    │  Panel   │
│          │                        │ (280px)  │
│ Dashboard│  Search bar            │ Avatar   │
│ Courses  │  Course cards          │ Username │
│ Calendar*│  Upload area (teacher) │ Settings │
│ Notes*   │  Materials (student)   │ 🌙/☀️    │
│ ──────── │                        │ To-Do    │
│ Settings │                        │  List    │
│ Account  │                        │          │
└──────────┴────────────────────────┴──────────┘
```
*Calendar & Notes are placeholders for now.

## Pages & Routes
| Route | Page | Access |
|---|---|---|
| `/` | Login Page | Public |
| `/teacher` | Teacher Dashboard | Teacher only |
| `/student` | Student Dashboard | Student only |
| `/courses` | Courses List | Logged in |
| `/calendar` | Calendar (placeholder) | Logged in |
| `/notes` | Notes (placeholder) | Logged in |

## Key Features
- **Dark/Light mode** toggle with localStorage persistence
- **User persistence** – remembered across sessions via localStorage
- **Teacher uploads** – text data via textarea or file input
- **Student access** – browse and view uploaded materials
- **Performance toggle** – disable heavy effects for low-end devices
- **Material UI** throughout with slightly rounded corners

## Auth (Current)
- Simple name + role selection (teacher/student)
- Email, password, signup/signin, social logins → **future features**

## Tech Stack
- React 19 + Vite 7
- Material UI 7 (`@mui/material`, `@mui/icons-material`)
- React Router DOM 7
- Supabase (backend)
- Emotion (CSS-in-JS, bundled with MUI)

## Run Locally
```bash
npm install
npm run dev
```

## File Structure
```
src/
├── components/
│   ├── AppLayout.jsx    # Main 3-column layout shell
│   ├── Sidebar.jsx      # Left navigation sidebar
│   ├── TopBar.jsx       # Top bar with tabs/search
│   └── UserPanel.jsx    # Right panel (profile + todo)
├── context/
│   ├── UserContext.jsx   # User auth state
│   └── ThemeContext.jsx  # Dark/light mode state
├── pages/
│   ├── LoginPage.jsx     # Auth page with gradient bg
│   ├── TeacherDashboard.jsx
│   ├── StudentDashboard.jsx
│   ├── CoursesPage.jsx
│   ├── CalendarPage.jsx  # Placeholder
│   └── NotesPage.jsx     # Placeholder
├── App.jsx               # Routes + theme provider
├── main.jsx
├── index.css
└── App.css
```
