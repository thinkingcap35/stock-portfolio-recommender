require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to inject API key into client-side code
app.use((req, res, next) => {
    if (req.url === '/client.js') {
        res.type('application/javascript');
        const clientJs = require('fs').readFileSync(path.join(__dirname, 'client.js'), 'utf8');
        const modifiedJs = clientJs.replace('YOUR_ALPHA_VANTAGE_API_KEY', process.env.ALPHA_VANTAGE_API_KEY || '');
        res.send(modifiedJs);
    } else {
        next();
    }
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Check if API key is configured
if (!process.env.ALPHA_VANTAGE_API_KEY) {
    console.warn('Warning: ALPHA_VANTAGE_API_KEY is not set in environment variables');
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
