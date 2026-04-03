# Mini Gmail React

A React + Vite + Netlify Functions + Supabase + Gmail SMTP/IMAP demo.

## What is included
- Sign up and login with Supabase
- Inbox list with page controls
- Previous / Next email reader controls
- Compose and send email
- Netlify Functions for Gmail SMTP and IMAP

## Before you run
1. Put your real Supabase URL and publishable key in `src/supabaseClient.js`
2. Create a `.env` file from `.env.example`
3. Put your Gmail credentials in `.env`
4. Run:
   - `npm install`
   - `npm run netlify:dev`

## Important
- Use the Supabase publishable key in the frontend
- Use Gmail App Password, not your normal Gmail password
- Do not put secret keys in React files
# react-gmail
