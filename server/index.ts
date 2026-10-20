import dotenv from "dotenv";
import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const localEnvPath = resolve(process.cwd(), ".env.local");
if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;
const apiKey = process.env.RESTCOUNTRIES_API_KEY;

app.get("/api/countries", async (request, response) => {
  const query = request.query.q;

  if (typeof query !== "string" || !query.trim()) {
    response.status(400).json({ error: "Enter a country name to search." });
    return;
  }

  if (!apiKey) {
    response.status(500).json({
      error: "RESTCOUNTRIES_API_KEY is missing. Add it to .env.local.",
    });
    return;
  }

  try {
    const upstream = await fetch(
      `https://api.restcountries.com/countries/v5?q=${encodeURIComponent(query.trim())}&limit=10`,
      {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(10_000),
      },
    );
    const body = await upstream.text();

    if (!upstream.ok) {
      console.error(`REST Countries API returned ${upstream.status}: ${body}`);
      response.status(upstream.status).json({
        error: "The country service could not complete your search. Please try again.",
      });
      return;
    }

    response.type("application/json").send(body);
  } catch (error) {
    console.error("Country lookup failed:", error);
    response.status(502).json({
      error: "Could not reach the country service. Check your connection and try again.",
    });
  }
});

const distPath = resolve(process.cwd(), "dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_request, response) => {
    response.sendFile(resolve(distPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Atlas API server listening on http://localhost:${port}`);
});
