import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from '../server/db.js';
import { seedDatabase } from '../server/seed.js';

import productRoutes from '../server/routes/productRoutes.js';
import orderRoutes from '../server/routes/orderRoutes.js';
import warehouseRoutes from '../server/routes/warehouseRoutes.js';
import scanRoutes from '../server/routes/scanRoutes.js';
import analyticsRoutes from '../server/routes/analyticsRoutes.js';
import activityRoutes from '../server/routes/activityRoutes.js';
import deliveryRoutes from '../server/routes/deliveryRoutes.js';
import demoRoutes from '../server/routes/demoRoutes.js';
import authRoutes from '../server/routes/authRoutes.js';
import manufacturerRoutes from '../server/routes/manufacturerRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Cache database connection for serverless invocations
let isConnected = false;
let isSeeded = false;

app.use(async (req, res, next) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
    if (!isSeeded) {
      await seedDatabase(false);
      isSeeded = true;
    }
    next();
  } catch (err) {
    console.error('Database connection error in serverless:', err);
    next(err);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'STOCKPILOT Serverless API',
    database: getDBStatus(),
    timestamp: new Date().toISOString(),
  });
});

// REST API Endpoints
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/manufacturer', manufacturerRoutes);

export default app;
