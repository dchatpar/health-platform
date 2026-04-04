import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

interface JoinRoomPayload {
  consultationId: string;
  token: string;
}

interface SignalPayload {
  consultationId: string;
  targetUserId?: string;
  signal?: any;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/consultations',
})
export class ConsultationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ConsultationsGateway.name);
  private readonly userSockets = new Map<string, Set<string>>(); // userId -> Set of socket ids
  private readonly socketUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store socket mappings
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      this.socketUsers.set(client.id, userId);

      client.data.userId = userId;

      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    } catch (error) {
      this.logger.warn(`Client ${client.id} failed authentication`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);

    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
      this.socketUsers.delete(client.id);

      this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinRoomPayload) {
    try {
      const { consultationId, token } = payload;

      // Verify consultation exists and user is part of it
      const consultation = await this.prismaService.consultation.findUnique({
        where: { id: consultationId },
        include: {
          appointment: {
            include: {
              patient: true,
              doctor: {
                include: { user: true },
              },
            },
          },
        },
      });

      if (!consultation) {
        client.emit('error', { message: 'Consultation not found' });
        return;
      }

      const userId = client.data.userId;
      const isPatient = consultation.appointment.patientId === userId;
      const isDoctor = consultation.appointment.doctor.userId === userId;

      if (!isPatient && !isDoctor) {
        client.emit('error', { message: 'Not authorized to join this consultation' });
        return;
      }

      // Join the room
      client.join(`consultation:${consultationId}`);

      // Notify others in the room
      client.to(`consultation:${consultationId}`).emit('user_joined', {
        userId,
        role: isDoctor ? 'doctor' : 'patient',
        socketId: client.id,
      });

      // Update consultation status
      if (consultation.status === 'WAITING') {
        await this.prismaService.consultation.update({
          where: { id: consultationId },
          data: { status: 'IN_PROGRESS', startedAt: new Date() },
        });
      }

      this.logger.log(`User ${userId} joined consultation ${consultationId}`);

      // Send current participants
      const participants = this.server.sockets.adapter.rooms.get(`consultation:${consultationId}`);
      client.emit('room_participants', {
        count: participants?.size || 1,
      });

      return { success: true, consultationId };
    } catch (error) {
      this.logger.error(`Error joining room: ${(error as Error).message}`);
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { consultationId: string },
  ) {
    const { consultationId } = payload;
    const userId = client.data.userId;

    client.leave(`consultation:${consultationId}`);

    client.to(`consultation:${consultationId}`).emit('user_left', {
      userId,
      socketId: client.id,
    });

    this.logger.log(`User ${userId} left consultation ${consultationId}`);

    return { success: true };
  }

  @SubscribeMessage('offer')
  async handleOffer(@ConnectedSocket() client: Socket, @MessageBody() payload: SignalPayload) {
    const { consultationId, targetUserId, offer } = payload;

    // Forward offer to the target user
    if (targetUserId) {
      const targetSockets = this.userSockets.get(targetUserId);
      if (targetSockets) {
        for (const socketId of targetSockets) {
          this.server.to(socketId).emit('offer', {
            fromUserId: client.data.userId,
            offer,
            consultationId,
          });
        }
      }
    } else {
      // Broadcast to all in room except sender
      client.to(`consultation:${consultationId}`).emit('offer', {
        fromUserId: client.data.userId,
        offer,
        consultationId,
      });
    }

    // Save offer to database
    await this.prismaService.consultation.update({
      where: { id: consultationId },
      data: { offer: JSON.stringify(offer) },
    });

    return { success: true };
  }

  @SubscribeMessage('answer')
  async handleAnswer(@ConnectedSocket() client: Socket, @MessageBody() payload: SignalPayload) {
    const { consultationId, targetUserId, answer } = payload;

    // Forward answer to the target user
    if (targetUserId) {
      const targetSockets = this.userSockets.get(targetUserId);
      if (targetSockets) {
        for (const socketId of targetSockets) {
          this.server.to(socketId).emit('answer', {
            fromUserId: client.data.userId,
            answer,
            consultationId,
          });
        }
      }
    } else {
      client.to(`consultation:${consultationId}`).emit('answer', {
        fromUserId: client.data.userId,
        answer,
        consultationId,
      });
    }

    // Save answer to database
    await this.prismaService.consultation.update({
      where: { id: consultationId },
      data: { answer: JSON.stringify(answer) },
    });

    return { success: true };
  }

  @SubscribeMessage('ice_candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SignalPayload,
  ) {
    const { consultationId, targetUserId, candidate } = payload;

    // Forward ICE candidate to the target user
    if (targetUserId) {
      const targetSockets = this.userSockets.get(targetUserId);
      if (targetSockets) {
        for (const socketId of targetSockets) {
          this.server.to(socketId).emit('ice_candidate', {
            fromUserId: client.data.userId,
            candidate,
            consultationId,
          });
        }
      }
    } else {
      client.to(`consultation:${consultationId}`).emit('ice_candidate', {
        fromUserId: client.data.userId,
        candidate,
        consultationId,
      });
    }

    return { success: true };
  }

  @SubscribeMessage('end_call')
  async handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { consultationId: string },
  ) {
    const { consultationId } = payload;
    const userId = client.data.userId;

    // Notify others
    client.to(`consultation:${consultationId}`).emit('call_ended', {
      endedBy: userId,
      consultationId,
    });

    // Update consultation status
    await this.prismaService.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });

    this.logger.log(`Call ended in consultation ${consultationId} by ${userId}`);

    return { success: true };
  }

  @SubscribeMessage('chat_message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { consultationId: string; message: string },
  ) {
    const { consultationId, message } = payload;
    const userId = client.data.userId;

    // Broadcast to all in room
    this.server.to(`consultation:${consultationId}`).emit('chat_message', {
      fromUserId: userId,
      message,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  // Helper method to send notification to a specific user
  sendToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }

  // Get room info
  getRoomInfo(consultationId: string) {
    const room = this.server.sockets.adapter.rooms.get(`consultation:${consultationId}`);
    return {
      consultationId,
      participantCount: room?.size || 0,
    };
  }
}
