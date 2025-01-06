const express = require('express');
const app = express();
const authRoutes = require('./src/routes/auth'); // Adjusted path to point to src/routes
const { sequelize } = require('./src/models'); // Adjusted path to point to src/models
require('dotenv').config(); // Load environment variables

// Middleware
app.use(express.json()); // Parse JSON requests

// Serve static files
app.use(express.static('./src/public')); // Serve static assets from public folder

// Set views
app.set('views', './src/views'); // Set the views directory
app.set('view engine', 'ejs'); // Assuming you're using EJS for the web interface

// Routes
app.use('/api/auth', authRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('Authentication API is running.');
});

// Sync Database and Start Server
const PORT = process.env.PORT || 5000;

sequelize.sync()
    .then(() => {
        console.log('Database connected and synced.');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });
