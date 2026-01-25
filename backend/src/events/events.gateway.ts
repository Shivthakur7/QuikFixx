import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow all for MVP
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(EventsGateway.name);

    handleConnection(client: Socket) {
        // In prod: Validate Token here
        // For MVP: Client joins a room based on their User ID sent in handshake query
        const userId = client.handshake.query.userId as string;
        if (userId) {
            client.join(`user:${userId}`);
            this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
        } else {
            this.logger.log(`Client connected: ${client.id} (Anonymous)`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Method to emit to a specific user
    notifyUser(userId: string, event: string, payload: any) {
        this.server.to(`user:${userId}`).emit(event, payload);
    }

    @SubscribeMessage('updateLocation')
    handleLocationUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: { lat: number; lng: number }) {
        // In a real app, we'd broadcast this to the person tracking them.
        // For now, just log or echo.
        const userId = client.handshake.query.userId;
        // Broadcast to anyone tracking this user (e.g., room `track:USER_ID`)
        // this.server.to(`track:${userId}`).emit('provider.location', data);
    }
}
