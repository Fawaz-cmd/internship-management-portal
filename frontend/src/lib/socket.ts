import { io } from 'socket.io-client';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export const socket = io(backendUrl, {
  autoConnect: false,
  transports: ['websocket']
});
