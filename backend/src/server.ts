// backend/src/server.ts
// URL Shortener Backend API - B.Tech Final Year Project
// Created by: Student Name | Roll No: YOUR_ROLL_NO
// Subject: Software Engineering Lab | Academic Year: 2024-25

import express from 'express';
import cors from 'cors';
import { urlStore, ShortUrl } from './store';
import { generateShortcode, isValidUrl, isValidShortcode } from './shortcode';
import { logInfo, logError } from './loggerClient';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies

// ============== API ENDPOINTS ==============

// 1. Create Short URL Endpoint
// POST /shorturls - This is our main feature!
app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    // Input validation - always validate user input!
    if (!url || !isValidUrl(url)) {
      await logError('route', 'Invalid URL provided', { url });
      return res.status(400).json({ error: 'Invalid URL provided' });
    }

    // Check custom shortcode format if user provided one
    if (shortcode && !isValidShortcode(shortcode)) {

      await logError('route', 'Invalid shortcode format', { shortcode });
      return res.status(400).json({ error: 'Invalid shortcode format (3-10 alphanumeric chars)' });
    }

    // Check if custom shortcode already exists (avoid duplicates)
    if (shortcode && await urlStore.getByShortcode(shortcode)) {
      await logError('route', 'Shortcode already exists', { shortcode });
      return res.status(400).json({ error: 'Shortcode already exists' });
    }

    // Generate shortcode if not provided by user
    let finalShortcode = shortcode;
    if (!finalShortcode) {
      // Keep generating until we get a unique one
      do {
        finalShortcode = generateShortcode();
      } while (await urlStore.getByShortcode(finalShortcode));
    }

    // Calculate expiry date (default: 30 days from now)
    const validityDays = validity || 30;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + validityDays);

    // Create our URL object (this is what we'll store)
    const shortUrl: ShortUrl = {
      id: Math.random().toString(36).substr(2, 9), // Generate unique ID
      originalUrl: url,
      shortcode: finalShortcode,
      expiry,
      createdAt: new Date(),
      clicks: 0 // Start with 0 clicks
    };

    // Save to our in-memory store
    await urlStore.create(shortUrl);

    // Build the full short link URL
    const shortLink = `http://localhost:${PORT}/${finalShortcode}`;
    
    await logInfo('route', 'Short URL created successfully', { 
      shortcode: finalShortcode, 
      originalUrl: url 
    });

    // Send success response to frontend
    res.json({ shortLink, expiry });
  } catch (error: unknown) {

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logError('route', 'Error creating short URL', { error: errorMessage });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get URL Statistics Endpoint
// GET /shorturls/:code - Check stats for any short URL
app.get('/shorturls/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Look up the shortcode in our store
    const shortUrl = await urlStore.getByShortcode(code);

    if (!shortUrl) {
      await logError('route', 'Short URL not found', { code });
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check if the URL has expired
    if (urlStore.isExpired(shortUrl)) {

      await logError('route', 'Short URL has expired', { code });
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    
    await logInfo('route', 'Short URL stats retrieved', { code });
    
    // Return all the statistics
    res.json({ 
      originalUrl: shortUrl.originalUrl, 
      expiry: shortUrl.expiry,
      clicks: shortUrl.clicks,
      createdAt: shortUrl.createdAt
    });
  } catch (error: unknown) {
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logError('route', 'Error retrieving URL stats', { error: errorMessage });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Health Check Endpoint (For testing if server is running)
app.get('/health', async (req, res) => {
  await logInfo('route', 'Health check requested');
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'URL Shortener API is running smoothly! ',
    version: '1.0.0'
  });
});

// 4. Redirect Endpoint (The magic happens here!)
// GET /:code - This is what happens when someone clicks a short URL
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Ignore browser requests for favicon
    if (code === 'favicon.ico') {
      return res.status(404).end();
    }

    await logInfo('route', 'Redirect requested', { code });
    const shortUrl = await urlStore.getByShortcode(code);

    if (!shortUrl) {
      await logError('route', 'Short URL not found for redirect', { code });
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check expiry before redirecting
    if (urlStore.isExpired(shortUrl)) {

      await logError('route', 'Short URL has expired for redirect', { code });
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    // Increment click counter (analytics!)
    await urlStore.incrementClick(code);

    await logInfo('route', 'Redirecting to original URL', { 
      code, 
      originalUrl: shortUrl.originalUrl,
      newClickCount: shortUrl.clicks + 1
    });

    // Perform the redirect (HTTP 302)
    res.redirect(shortUrl.originalUrl);
  } catch (error: unknown) {
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logError('route', 'Error during redirect', { error: errorMessage });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============== SERVER STARTUP ==============

// Start the server
app.listen(PORT, () => {
  const serverInfo = {
    port: PORT,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  console.log(` URL Shortener server started on port ${PORT}`);
  
  // Log to external service (non-blocking)
  logInfo('service', `URL Shortener server started successfully on port ${PORT}`, serverInfo)
    .catch(err => console.error('Logging failed:', err));
});
