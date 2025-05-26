# Zwarm 🐝

**Zwarm is a web platform designed to facilitate online collaboration on projects and "missions" for individuals who may not know each other.** Unlike traditional platforms focused solely on coding or general discussion, Zwarm aims to bring people together to actively work on specific, open-source-style initiatives across diverse domains.

**The Core Idea:** Pick a mission. Join the swarm. Make an impact.

## About Zwarm

Zwarm's purpose is to direct the energetic, self-organizing nature of online communities towards productive, collaborative work. Projects on Zwarm can include:

* **Open Source Software Development**: Building software tools collaboratively.
* **Activism**: Organizing and executing campaigns for social or political causes.
* **Investigations**: Crowdsourcing research and analysis on a topic.
* **Creative Projects**: Collaborative writing, art creation, video production, etc.
* **"Missions"**: Goal-oriented tasks that internet communities can rally behind.

The platform emphasizes community value and open collaboration. The initial core of Zwarm is envisioned as a free, open-source platform.

## Tech Stack

Zwarm is being built with a modern, robust tech stack:

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
* **Backend & Database**: [Supabase](https://supabase.io/)
  * Authentication: Supabase Auth
  * Database: Supabase PostgreSQL
* **ORM**: [Prisma](https://www.prisma.io/)
* **Linting/Formatting**: ESLint, Prettier (assumed, good practice)

## Current Features (As of May 26, 2025)

* **User Authentication**:
  * Sign-up with email, password, username, and profile emoji.
  * Email confirmation flow.
  * Sign-in and sign-out.
  * User profiles created in the database, linked to Supabase Auth.
* **Frontend Foundation**:
  * Basic homepage layout with a hero section and placeholders for trending missions.
  * Dynamic header that reflects user authentication status.
  * Styling based on a black and yellow color palette with elements of glassmorphism and subtle animations.
  * Animated "swarm" background effect.
* **Database Schema**:
  * Initial Prisma schema for `User` and `Mission` models.
  * Supabase trigger to automatically create public user profiles upon auth sign-up.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v18.18.0 or later recommended)
* npm, yarn, pnpm, or bun (the project uses npm in `package.json`)
* A Supabase account and project.

### Installation & Setup

1. **Clone the repository (if applicable, or download the files):**

    ```bash
    # git clone <your-repo-url>
    # cd zwarm
    ```

2. **Install dependencies:**

    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    # or
    # bun install
    ```

3. **Set up environment variables:**
    * Create a `.env.local` file in the root of your project.
    * Add your Supabase project URL, anon key, and database connection strings:

        ```env
        # .env.local

        # For Supabase client (frontend & server components/actions)
        NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key

        # For Prisma (backend, migrations)
        DATABASE_URL="your_supabase_postgresql_connection_string_with_pooler_if_applicable"
        DIRECT_URL="your_supabase_postgresql_direct_connection_string_for_migrations"
        ```

    * You can find these values in your Supabase project dashboard (Project Settings > API for URL/anon key, and Database > Connection string for database URLs).

4. **Set up the Supabase Database Trigger:**
    * Log in to your Supabase project dashboard.
    * Navigate to the SQL Editor.
    * Run the SQL script provided in the project (or documentation) to create the `handle_new_user` function and its associated trigger on the `auth.users` table. This function populates your public `User` table upon new user sign-up.
        *(You'd typically link to the SQL file or include it here if it's stable)*

5. **Run database migrations (if you haven't already or if the schema changed):**
    * Ensure your `DATABASE_URL` and `DIRECT_URL` in `.env.local` are correctly configured for Prisma.

    ```bash
    npx prisma migrate dev
    ```

6. **Run the development server:**

    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    # or
    # bun dev
    ```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Roadmap (Next Steps)

* **Refine Typography System**: Finalize the approach to typography (Tailwind direct usage vs. CSS variables).
* **Mission Ownership**: Complete the `Mission-User` relationship in Prisma schema.
* **Mission CRUD Operations**:
  * Backend logic (API Routes or Server Actions) for creating, reading (list & single), updating, and deleting missions.
  * Frontend pages/forms for creating new missions, viewing mission lists, and viewing single mission details.
* **User Profiles**: Dedicated user profile pages.
* **Mission Participation**: Logic for users to join/follow/contribute to missions.
* **Task Management**: Within missions.
* **Further UI/UX Enhancements**.

## Contributing

*(This section can be filled out later if you plan to open-source or accept contributions.)*

---

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Inter](https://fonts.google.com/specimen/Inter) (or Geist, if you switch back to the default create-next-app font).
