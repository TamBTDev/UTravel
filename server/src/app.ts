/**
 * Express App Setup
 *
 * Middleware theo thứ tự:
 * 1. cors (config/cors)
 * 2. express.json()
 * 3. express.urlencoded({ extended: true })
 * 4. Routes: app.use('/api', routes)
 * 5. Error handler middleware (cuối cùng)
 *
 * Import routes từ từng module và mount:
 * - /api/auth → auth.routes
 * - /api/hotels → hotel.routes
 * - /api/rooms → room.routes
 * - /api/bookings → booking.routes
 * - /api/payments → payment.routes
 * - /api/users → user.routes
 * - /api/reviews → review.routes
 */
import express, { Application } from 'express';
import path from 'path';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { errorHandler } from './middlewares/error.middleware';

import authRoutes from './modules/auth/auth.routes.js';
import hotelRoutes from './modules/hotels/hotels.routes.js';
import roomRoutes from './modules/rooms/rooms.routes.js';
import bookingRoutes from './modules/bookings/bookings.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import userRoutes from './modules/users/users.routes.js';

const app: Application = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
