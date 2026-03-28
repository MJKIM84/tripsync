import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export function setupSocket(io: Server) {
  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthUser;
      (socket as Socket & { user: AuthUser }).user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as Socket & { user: AuthUser }).user;
    console.log(`User connected: ${user.name} (${user.id})`);

    // Join trip room
    socket.on('join_trip', ({ tripId }: { tripId: string }) => {
      socket.join(`trip:${tripId}`);
      socket.to(`trip:${tripId}`).emit('user:online', { userId: user.id, name: user.name });
    });

    // Leave trip room
    socket.on('leave_trip', ({ tripId }: { tripId: string }) => {
      socket.leave(`trip:${tripId}`);
      socket.to(`trip:${tripId}`).emit('user:offline', { userId: user.id, name: user.name });
    });

    // Schedule events
    socket.on('schedule:created', (data) => {
      socket.to(`trip:${data.tripId}`).emit('schedule:created', data);
    });
    socket.on('schedule:updated', (data) => {
      socket.to(`trip:${data.tripId}`).emit('schedule:updated', data);
    });
    socket.on('schedule:deleted', (data) => {
      socket.to(`trip:${data.tripId}`).emit('schedule:deleted', data);
    });

    // Journal events
    socket.on('journal:created', (data) => {
      socket.to(`trip:${data.tripId}`).emit('journal:created', data);
    });

    // Photo events
    socket.on('photo:uploaded', (data) => {
      socket.to(`trip:${data.tripId}`).emit('photo:uploaded', data);
    });

    // Member events
    socket.on('member:joined', (data) => {
      socket.to(`trip:${data.tripId}`).emit('member:joined', data);
    });

    // Budget events
    socket.on('budget:created', (data) => {
      socket.to(`trip:${data.tripId}`).emit('budget:created', data);
    });
    socket.on('budget:updated', (data) => {
      socket.to(`trip:${data.tripId}`).emit('budget:updated', data);
    });

    // Checklist events
    socket.on('checklist:item_checked', (data) => {
      socket.to(`trip:${data.tripId}`).emit('checklist:item_checked', data);
    });
    socket.on('checklist:item_unchecked', (data) => {
      socket.to(`trip:${data.tripId}`).emit('checklist:item_unchecked', data);
    });

    // Activity feed
    socket.on('activity:new', (data) => {
      socket.to(`trip:${data.tripId}`).emit('activity:new', data);
    });

    // Comment events
    socket.on('comment:created', (data) => {
      socket.to(`trip:${data.tripId}`).emit('comment:created', data);
    });

    // Chat events
    socket.on('chat:send', (data) => {
      socket.to(`trip:${data.tripId}`).emit('chat:message', data);
    });
    socket.on('chat:typing', (data) => {
      socket.to(`trip:${data.tripId}`).emit('chat:typing', { userId: user.id, name: user.name });
    });
    socket.on('chat:stop_typing', (data) => {
      socket.to(`trip:${data.tripId}`).emit('chat:stop_typing', { userId: user.id });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.name}`);
    });
  });
}
