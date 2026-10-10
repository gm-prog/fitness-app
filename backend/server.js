// server.js
// Load .env from an explicit absolute path (this directory) so configuration is
// found no matter which working directory the process is started from.
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const aiRouter = require('./routers/ai');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors()); 
app.use(bodyParser.json());

// Database Connection
if (!MONGO_URI) {
  console.error('MONGO_URI is required. Add it to backend/.env (e.g. MONGO_URI=mongodb://localhost:27017/fitness-app).');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err.message));
}

// Routes
app.use('/ai', aiRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
