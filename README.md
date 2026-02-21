# Lingo Education Prototype – Frontend (`text-bridge`)

This is a small React + Vite application that exercises the Lingo.dev translation API through a Supabase Edge Function.

It provides a minimal **teacher / student** workflow:

- **Teacher**: creates study texts.
- **Student**: browses texts and requests translations into different languages, with results cached in Supabase.

## Running the app

1. **Install dependencies** (from the project root or `text-bridge` folder):

```bash
cd text-bridge
npm install
```

2. **Configure Supabase environment**:

- Copy `.env.example` to `.env.local` or `.env` inside `text-bridge`:

```bash
cp .env.example .env.local
```

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to match your Supabase (local or hosted) project.

3. **Start the dev server**:

```bash
npm run dev
```

Open the printed URL in your browser (typically `http://localhost:5173`).

## Screens and flow

- **`/` – Login-like screen**
  - Enter a display **name**.
  - Choose a **role** (`Teacher` or `Student`).
  - On continue, you are routed to `/teacher` or `/student`.

- **`/teacher` – Teacher dashboard**
  - Create new texts with `title`, `language` (e.g. `en`, `es`), and multiline `content`.
  - See a list of existing texts.

- **`/student` – Student dashboard**
  - Select a text from the list.
  - See the original content and source language.
  - Pick a `target language` and click **Translate**.
  - The app calls the Supabase Edge Function, which:
    - Checks for a cached translation in the `translations` table.
    - If present, returns it with `fromCache = true`.
    - Otherwise, calls Lingo.dev, stores the translation, and returns it with `fromCache = false`.

