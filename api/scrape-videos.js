const puppeteer = require('puppeteer');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get limit parameter from query string, default to 20
    const limit = parseInt(req.query.limit) || 20;
    
    // Validate limit (max 100 to prevent abuse)
    if (limit > 100) {
        return res.status(400).json({ error: 'Limit cannot exceed 100' });
    }

    if (limit < 1) {
        return res.status(400).json({ error: 'Limit must be at least 1' });
    }

    let browser;
    
    try {
        // Launch browser with optimized settings for Vercel
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const url = `https://batibot.org/load_more_random.php?start=0&limit=${limit}`;
        console.log('Navigating to:', url);
        
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Wait for content to load
        await page.evaluate(() => {
            return new Promise(resolve => setTimeout(resolve, 3000));
        });

        // Extract video data
        const videoData = await page.evaluate(() => {
            const videos = [];

            // Look for video elements
            const videoElements = document.querySelectorAll('video, iframe');
            videoElements.forEach(video => {
                // Get title from multiple possible sources
                let title = video.getAttribute('title') || 
                           video.getAttribute('alt') ||
                           video.getAttribute('data-title') ||
                           video.closest('div')?.getAttribute('data-title') ||
                           video.closest('article')?.querySelector('h1, h2, h3, h4, h5, h6')?.innerText?.trim() ||
                           video.closest('div')?.querySelector('h1, h2, h3, h4, h5, h6')?.innerText?.trim();

                const videoUrl = video.src || video.getAttribute('src');
                const thumbnail = video.poster || video.getAttribute('poster');

                // Only add if ALL three fields are not empty
                if (videoUrl && thumbnail && title) {
                    videos.push({
                        type: video.tagName,
                        videoUrl: videoUrl,
                        thumbnail: thumbnail,
                        title: title
                    });
                }
            });

            // Look for containers with video data
            const containers = document.querySelectorAll('div, article, section');
            containers.forEach(container => {
                const videoUrl = container.getAttribute('data-video-url') || 
                               container.getAttribute('data-video') ||
                               container.querySelector('a')?.href;
                
                const thumbnail = container.getAttribute('data-thumbnail') ||
                                container.getAttribute('data-poster') ||
                                container.querySelector('img')?.src;

                // Enhanced title extraction from containers
                let title = container.getAttribute('data-title') ||
                          container.getAttribute('title') ||
                          container.getAttribute('aria-label') ||
                          container.querySelector('h1, h2, h3, h4, h5, h6')?.innerText?.trim() ||
                          container.querySelector('[class*="title"], [class*="name"], [class*="heading"]')?.innerText?.trim() ||
                          container.querySelector('img')?.getAttribute('alt') ||
                          container.querySelector('a')?.getAttribute('title');

                // Only add if ALL three fields are not empty
                if (videoUrl && thumbnail && title) {
                    videos.push({
                        type: 'container',
                        videoUrl: videoUrl,
                        thumbnail: thumbnail,
                        title: title
                    });
                }
            });

            return videos;
        });

        // Filter to only include items with all three fields
        const filteredVideos = videoData.filter(item => item.videoUrl && item.thumbnail && item.title);
        
        console.log(`Found ${filteredVideos.length} videos with all three fields`);

        // Return success response
        return res.status(200).json({
            success: true,
            count: filteredVideos.length,
            limit: limit,
            videos: filteredVideos
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
