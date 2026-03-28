import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

let globalSocket: Socket | null = null;

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    if (!globalSocket) {
      globalSocket = io('/', {
        auth: { token: accessToken },
        transports: ['websocket'],
      });
    }

    return () => {};
  }, [accessToken]);

  return globalSocket;
}

export function useTripSocket(tripId: string | undefined) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !tripId) return;

    socket.emit('join_trip', { tripId });

    return () => {
      socket.emit('leave_trip', { tripId });
    };
  }, [socket, tripId]);

  return socket;
}
