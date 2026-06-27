import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt';

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: env.frontendUrl,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Unauthorized'));
    }

    try {
      const user = verifyAccessToken(token);
      socket.data.user = user;
      socket.join(`role:${user.role}`);
      socket.join(`user:${user.userId}`);
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('internship:join', (internshipId: string) => {
      socket.join(`internship:${internshipId}`);
    });

    socket.on('collaboration:update', (payload: { internshipId: string; message: string }) => {
      const actor = socket.data.user?.email ?? 'unknown';
      io.to(`internship:${payload.internshipId}`).emit('collaboration:received', {
        ...payload,
        actor,
        timestamp: new Date().toISOString()
      });
    });
  });

  return io;
};
