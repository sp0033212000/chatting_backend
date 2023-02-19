import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'typeorm';

export class SocketAdapter extends IoAdapter {
  createIOServer(
    port: number,
    options?: ServerOptions & {
      namespace?: string;
      server?: any;
    },
  ) {
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: 'http://localhost:3005',
        methods: ['GET', 'POST'],
      },
    });
  }
}
