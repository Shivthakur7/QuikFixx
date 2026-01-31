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

    @SubscribeMessage('joinBooking')
    handleJoinBooking(@ConnectedSocket() client: Socket, @MessageBody() data: { bookingId: string }) {
        const roomName = `booking:${data.bookingId}`;
        client.join(roomName);
        this.logger.log(`Client ${client.id} joined room: ${roomName}`);
    }

    @SubscribeMessage('updateLocation')
    handleLocationUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: { bookingId: string; lat: number; lng: number }) {
        this.logger.debug(`Location update for booking ${data.bookingId}: ${data.lat}, ${data.lng}`);
        // Broadcast to the specific booking room so customers watching this booking see it
        this.server.to(`booking:${data.bookingId}`).emit('provider.location', data);
    }
}
