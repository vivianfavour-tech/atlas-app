# Atlas

Atlas is a dark-themed country explorer built with React, TypeScript, and the REST Countries API. Its landing page is a browsable wall of Asian country flags; selecting a flag or searching by name opens a detailed country profile.

## Run locally

1. Copy `.env.example` to `.env.local` and set `RESTCOUNTRIES_API_KEY` to your REST Countries API key.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

Vite serves the React app and forwards `/api` requests to the local Express server. The API key stays on the server and is never included in the browser bundle. For production, set `RESTCOUNTRIES_API_KEY` in the server environment and run `npm run build` followed by `npm start`.
