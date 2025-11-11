# Cloudflare Worker for Training Tips

This Cloudflare Worker fetches dog training tips from Firecrawl API and serves them with edge caching.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```

3. **Set Firecrawl API key:**
   ```bash
   npx wrangler secret put FIRECRAWL_API_KEY
   ```
   Paste your API key when prompted (get it from https://firecrawl.dev)

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Copy the worker URL** and add it to your app's environment variables as `CLOUDFLARE_WORKER_URL`

## Development

Run locally:
```bash
npm run dev
```

View logs:
```bash
npm run tail
```

## Usage

Call the worker with a topic query parameter:

```
GET https://your-worker.workers.dev?topic=basic-training
```

Available topics:
- `basic-training`
- `socialization`
- `impulse-control`
- `puppy-training`
- `obedience`

## Response Format

```json
{
  "title": "Basic Dog Training Fundamentals",
  "description": "Start with simple commands...",
  "keyPoints": [
    "Use positive reinforcement",
    "Keep sessions short and fun"
  ],
  "source": "AKC",
  "topic": "basic-training",
  "fetchedAt": "2024-01-01T12:00:00.000Z"
}
```

