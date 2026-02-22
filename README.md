<p align="center">
  <img src="src/assets/logo full.png" alt="LingoEdu" width="100%" style="max-height: 200px; object-fit: contain;" />
</p>

<p align="center">
  <strong>The modern classroom translation & content platform for educators and students.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="about.md">Full Documentation</a>
</p>

---

## What is LingoEdu?

**LingoEdu** is a web-based education platform that empowers teachers to share learning materials and gives students instant access to AI-powered translations in 100+ languages. Built for multilingual classrooms, language courses, and international learning environments.

Teachers create classrooms, upload texts, and manage content. Students join classrooms, browse materials, and translate content into their preferred language — all in real time.

## Features

- **Classroom Management** — Create, join, and manage virtual classrooms with unique invite codes
- **Content Upload** — Teachers publish texts, PDFs, images, and video links
- **AI Translation** — Students translate materials into any supported language via [Lingo.dev](https://lingo.dev)
- **Smart Caching** — Translations are stored in Supabase for instant retrieval on repeat requests
- **Full Calendar View** — Track classroom activity and content schedules at a glance
- **Dark / Light Themes** — Adaptive UI with system preference support
- **Multilingual Interface** — The entire UI dynamically translates to the user's chosen language
- **Personal Todo List** — Built-in task tracker for student productivity

## Getting Started

### Prerequisites

- **Node.js** 18+
- A **Supabase** project (local or hosted)
- A **Lingo.dev** API key

### Installation

```bash
git clone https://github.com/VectorBlue-06/LingoEdu.git
cd lingoedu
npm install
```

### Configuration

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_LINGO_API_KEY` | Lingo.dev translation API key |

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Material UI 7 |
| Routing | React Router DOM 7 |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Translation | Lingo.dev SDK |
| Styling | Emotion (CSS-in-JS via MUI) |

## License

MIT

---

<p align="center">
  Made with purpose for multilingual education.
</p>
