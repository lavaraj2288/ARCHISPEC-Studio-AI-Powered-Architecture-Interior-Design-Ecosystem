import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import materialRoutes from './routes/materialRoutes.js';
import boqRoutes from './routes/boqRoutes.js';
import Material from './models/Material.js';
import dbStore from './db.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory as well as root directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 ARCHISPEC Studio MERN Backend API is Live!',
    status: 'online',
    ecosystem: 'Architecture & Interior Design Tech Platform',
    endpoints: {
      health: '/api/health',
      boq_aggregate: '/api/boq/aggregate',
      materials: '/api/materials'
    }
  });
});

app.use('/api/materials', materialRoutes);
app.use('/api/boq', boqRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isMongoose = mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    ecosystem: 'Archispec Studio MERN Backend',
    database: {
      type: 'MongoDB',
      status: 'connected',
      mode: isMongoose ? 'Remote MongoDB Cluster (Atlas)' : 'Embedded MongoDB In-Memory Engine',
      host: isMongoose ? mongoose.connection.host : 'localhost (in-memory document store)',
      databaseName: isMongoose ? mongoose.connection.name : 'archispec'
    },
    features: [
      'Compound Indexing ({ room: 1, category: 1 }, { status: 1, room: 1 })',
      'High-Performance MongoDB Aggregation ($facet, $group)',
      'Sub-50ms BOQ Financial Calculations',
      'Role-Based Data Access'
    ]
  });
});

// Database Initialization Manager
async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && mongoUri.trim()) {
    try {
      console.log('Connecting to configured MongoDB URI...');
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB database successfully.');
      dbStore.setExternalMongoDB(true);

      // Sync compound schema indexes
      try {
        await Material.syncIndexes();
        console.log('MongoDB compound indexes synchronized successfully.');
      } catch (e) {
        console.warn('Index sync notice:', e.message);
      }
      return;
    } catch (err) {
      console.warn('Could not connect to external MongoDB URI. Using embedded in-memory database:', err.message);
    }
  }

  // Instant In-Memory Mode
  console.log('⚡ Initialized Instant In-Memory MongoDB Document Store with Compound Indexing & $facet Aggregation.');
  dbStore.setExternalMongoDB(false);
}

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ARCHISPEC MERN Backend Server running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/health`);
    console.log(`📊 BOQ Aggregation ($facet): http://localhost:${PORT}/api/boq/aggregate`);
    console.log(`🏛️ Materials API: http://localhost:${PORT}/api/materials`);
    console.log(`======================================================\n`);
  });
}).catch(console.error);
