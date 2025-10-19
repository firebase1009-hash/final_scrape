# Video Scraper API

A Vercel-deployable API for scraping videos from batibot.org with parameterized limits.

## Features

- 🎯 Parameterized limit (1-100 videos)
- 🚀 Deployable on Vercel
- 🔒 CORS enabled
- ⚡ Optimized for serverless functions
- 🛡️ Input validation and error handling

## API Endpoint

### GET `/api/scrape-videos`

Scrapes videos from batibot.org with a specified limit.

#### Parameters

- `limit` (optional): Number of videos to scrape (1-100, default: 20)

#### Example Requests

```bash
# Default limit (20 videos)
GET https://your-app.vercel.app/api/scrape-videos

# Custom limit (50 videos)
GET https://your-app.vercel.app/api/scrape-videos?limit=50

# Minimum limit (1 video)
GET https://your-app.vercel.app/api/scrape-videos?limit=1
```

#### Response Format

```json
{
  "success": true,
  "count": 15,
  "limit": 20,
  "videos": [
    {
      "type": "VIDEO",
      "videoUrl": "https://example.com/video.mp4",
      "thumbnail": "https://example.com/thumb.jpg",
      "title": "Video Title"
    }
  ]
}
```

#### Error Responses

```json
{
  "success": false,
  "error": "Limit cannot exceed 100",
  "message": "Limit must be between 1 and 100"
}
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run locally with Vercel CLI:
   ```bash
   npx vercel dev
   ```

3. Test the endpoint:
   ```bash
   curl "http://localhost:3000/api/scrape-videos?limit=5"
   ```

## Deployment to Vercel

### Method 1: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

### Method 2: GitHub Integration

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Vercel will automatically deploy on every push

### Method 3: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your repository
4. Deploy

## Configuration

The API is configured with:
- 30-second timeout for serverless functions
- Optimized Puppeteer settings for Vercel
- CORS headers for cross-origin requests
- Input validation for the limit parameter

## Limitations

- Maximum limit: 100 videos per request
- Function timeout: 30 seconds
- Vercel free tier has usage limits

## Troubleshooting

### Common Issues

1. **Timeout errors**: Reduce the limit parameter
2. **Memory issues**: Vercel has memory limits for serverless functions
3. **Rate limiting**: The target website may have rate limits

### Debug Mode

To debug locally, you can modify the Puppeteer launch options in `api/scrape-videos.js`:

```javascript
browser = await puppeteer.launch({
    headless: false, // Set to false for debugging
    // ... other options
});
```

## License

MIT
