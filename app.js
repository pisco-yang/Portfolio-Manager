const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./backend/config/db');
const portfolioRoutes = require('./backend/routers/portfolioRouter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// API Health check
app.get('/api/health', (req, res) => {
  res.sendFile(__dirname + '/frontend/index.html');
});

app.use(express.static('frontend')); // for your HTML

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Routes
app.use('/api/portfolio', portfolioRoutes);

// Start server
app.listen(PORT, async () => {
  try {
    await db.getConnection(); // Quick test connection
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Failed to connect to the database:', err.message);
  }
});
