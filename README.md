# Better-OpenClaw-Dashboard

A modern web dashboard for managing [OpenClaw](https://openclaw.ai) — your personal AI assistant gateway.

## Features

- **Overview** — Gateway connection status, quick stats (instances, sessions, cron jobs, uptime)
- **Cron Jobs** — Create, enable/disable, run, and remove scheduled tasks with multiple schedule types (every, at, cron expression)
- **Sessions** — View and manage active sessions with filtering (active minutes, global, unknown)
- **Usage & Costs** — Visualize daily costs with bar charts, token breakdowns, and insights (top model, cache hit rate, error rate)
- **Configuration** — Browse and edit all settings with info-circle tooltips explaining each option
- **Gateway Auto-Detection** — Automatically detects when the OpenRouter gateway comes online (polls every 5 seconds)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Testing

```bash
npm test
```

Runs Playwright end-to-end tests against the dashboard UI.

## Build

```bash
npm run build
```

Produces a production build in the `dist/` directory.