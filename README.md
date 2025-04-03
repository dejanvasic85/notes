<a href="/" align="center" >
  <img alt="Notes App - A personal notes application" src="src/lib/images/notes-main.png" style="height: 100px; display: flex; justifty-content: center; align-items: center; margin: 0 auto;" />
  <h1 align="center">My Notes App</h1>
</a>

<p align="center">
  A personal, open-source notes application inspired by Google Keep, built with Svelte.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tooling"><strong>Tooling</strong></a> ·
  <a href="#developing-and-running-locally"><strong>Developing and Running Locally</strong></a>
</p>
<br/>

## Features

- Create notes with a Google Keep-inspired style.
- Color-code notes for better organization.
- Simple, one board per user.
- Drag-and-drop functionality to reorder notes.
- Share notes with others.
- Invite friends via email.
- Progressive Web App (PWA) for easy installation on phones and desktops.
- Interactive homepage to try out the app.

## Tooling

- **Svelte**: Initially built with Svelte 4 and upgraded to Svelte 5.
- **Tailwind CSS**: For styling.
- **Prisma + Postgres**: Database and ORM.
- **FP-TS**: Functional programming utilities.
- **Vite**: Lightning-fast build tool.
- **Playwright**: For end-to-end testing.
- **Vercel**: Hosting and deployment.

## Why I Built This

I developed this application for myself and my family members, but it is open-source and free for anyone to use. It was my way of learning Svelte and improving my frontend and functional programming skills. Another motivation was to reduce reliance on apps like Google Keep by creating a personal alternative.

## Developing and Running Locally

To run the app locally, follow these steps:

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

3. **Optional: Use Docker for Postgres**:

   - Set up a Postgres database using Docker:
     ```bash
     docker run --name notes-postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres
     ```
   - Update your `.env` file with the database connection details.

4. **Environment Variables**:

   - Configure environment variables in a `.env` file. These will be automatically available via `$env/static/private`.

5. **Preview the app**:
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deploying

To deploy the app, you can use Vercel or any other hosting provider. Make sure to configure the necessary environment variables in your deployment settings.

---

This project is a labor of love and a way to explore modern web development. Contributions and feedback are welcome!
