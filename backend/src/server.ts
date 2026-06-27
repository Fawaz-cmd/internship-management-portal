import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { initializeSocket } from './socket';

const app = createApp();
const server = createServer(app);

initializeSocket(server);

server.listen(env.port, () => {
  console.log(`Backend server listening on port ${env.port}`);
});
