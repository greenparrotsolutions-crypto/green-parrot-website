# Green Parrot Solutions — Agency Website

Express + EJS + vanilla JS + GSAP, per the design brief.

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000

## Project structure

```
green-parrot-solutions/
├── server.js
├── package.json
├── .env
├── .gitignore
├── vercel.json
├── public/
│   ├── css/ (style.css, responsive.css)
│   ├── js/ (main.js, animations.js, contact.js)
│   ├── images/ (logo, hero, services, crm, icons — add real assets here)
│   └── favicon/
├── views/
│   ├── index.ejs
│   ├── legal.ejs
│   └── partials/ (header.ejs, footer.ejs)
└── data/
    └── leads.json
```

## IMPORTANT: storage caveat before you rely on this for real leads

Contact form submissions are stored in `data/leads.json`, a plain JSON
file, instead of SQLite. This was a deliberate choice — SQLite needs a
native binary that frequently fails to build on serverless platforms
like Vercel — but it comes with its own real limitation:

**If this app is deployed to Vercel specifically, `data/leads.json`
writes may not persist.** Vercel's serverless functions have a
read-only/ephemeral filesystem at runtime — a lead saved in one request
is not guaranteed to still be there on the next request, and will
definitely be wiped on every redeploy.

This is fine for local development and for any host with a real,
persistent filesystem (Railway, Render, a traditional VPS, etc.). It is
**not reliable for capturing real client leads if deployed to Vercel.**

### Before this goes live for real leads, do one of:

1. **Host it somewhere with persistent storage** — Railway or Render
   are both simple, low-cost options for a small Express app like this,
   and `data/leads.json` will work exactly as-is.
2. **Keep it on Vercel, but change where leads go** — swap the
   `saveLead()` function in `server.js` for something that doesn't rely
   on the local filesystem: sending an email (e.g. via Resend or
   Nodemailer + an SMTP provider), posting to a Google Sheets webhook,
   or writing to a real hosted database (Supabase, Postgres, etc.).

Either is a small, contained change — the validation and response
logic in `server.js` doesn't need to change, only the `saveLead`
function's internals.

## Deploying to Vercel (works, with the caveat above)

```
vercel.json is already configured to run server.js as a Node
serverless function. Push this repo to GitHub, import it in Vercel as
a new project, and it will deploy automatically — no extra config
needed for the site itself to load and render correctly.
```

## Placeholder content to replace before launch

- Logo: currently a temporary SVG parrot icon + text wordmark in
  `views/partials/header.ejs` and `footer.ejs` — replace with a real
  logo file once available.
- Social links in the footer point to placeholder URLs
  (instagram.com, facebook.com, etc.) — update to your actual profiles.
- Privacy Policy and Terms pages (`views/legal.ejs`) have placeholder
  body text — replace with real legal content before launch.
- Favicon: add a real file at `public/favicon/favicon.ico`.

## Sections intentionally excluded (per the brief)

"Brands We've Helped Grow" and "Real People. Real Results." were left
out for now, to be added later without a redesign.
