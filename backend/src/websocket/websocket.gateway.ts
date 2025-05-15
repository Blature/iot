import { Logger } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TemperatureReading } from 'src/temperature/temperature-reading.interface';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class WebsocketGateway {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(WebsocketGateway.name);

    broadcastUpdate(payload: TemperatureReading) {
        this.logger.log(`Broadcasting: ${JSON.stringify(payload)}`);
        this.server.emit('temperature-update', payload);
    }
}
