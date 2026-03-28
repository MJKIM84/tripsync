import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import scheduleRoutes from './routes/schedule.routes';
import journalRoutes from './routes/journal.routes';
import photoRoutes from './routes/photo.routes';
import placeRoutes from './routes/place.routes';
import budgetRoutes from './routes/budget.routes';
import memberRoutes from './routes/member.routes';
import commentRoutes from './routes/comment.routes';
import checklistRoutes from './routes/checklist.routes';
import documentRoutes from './routes/document.routes';
import feedRoutes from './routes/feed.routes';
import notificationRoutes from './routes/notification.routes';
import settingsRoutes from './routes/settings.routes';
import chatRoutes from './routes/chat.routes';
import { setupSocket } from './socket';
import path from 'path';

const app = express();
const httpServer = createServer(app);

const isProduction = process.env.NODE_ENV === 'production';
const corsOrigin = isProduction ? true : (process.env.CLIENT_URL || 'http://localhost:5173');

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips', scheduleRoutes);
app.use('/api/trips', journalRoutes);
app.use('/api/trips', photoRoutes);
app.use('/api/trips', placeRoutes);
app.use('/api/trips', budgetRoutes);
app.use('/api/trips', memberRoutes);
app.use('/api/trips', commentRoutes);
app.use('/api/trips', checklistRoutes);
app.use('/api/trips', documentRoutes);
app.use('/api/trips', feedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/trips', chatRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Error handler
app.use(errorHandler);

// Serve client build in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Socket.io
setupSocket(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
