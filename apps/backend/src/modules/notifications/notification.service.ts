import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SendNotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async send(payload: SendNotificationPayload) {
    const { userId, type, title, message, data } = payload;

    const notification = await this.prismaService.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || undefined,
        sent: true,
        sentAt: new Date(),
      },
    });

    this.logger.log(`Notification sent to user ${userId}: ${title}`);

    // In production, this would also push to email/SMS/push notification services
    // For now, we just store in database

    return notification;
  }

  async sendBulk(userIds: string[], payload: Omit<SendNotificationPayload, 'userId'>) {
    const notifications = await this.prismaService.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data || undefined,
        sent: true,
        sentAt: new Date(),
      })),
    });

    this.logger.log(`Bulk notification sent to ${userIds.length} users: ${payload.title}`);

    return { count: notifications.count };
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    userId: string;
    type?: string;
    read?: boolean;
  }) {
    const { skip = 0, take = 20, userId, type, read } = params;

    const where: any = { userId };
    if (type) where.type = type;
    if (read !== undefined) where.read = read;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prismaService.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.notification.count({ where }),
      this.prismaService.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
        unreadCount,
      },
    };
  }

  async findOne(id: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAsRead(id: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return this.prismaService.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prismaService.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { count: result.count };
  }

  async delete(id: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.prismaService.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted successfully' };
  }

  async deleteAllRead(userId: string) {
    const result = await this.prismaService.notification.deleteMany({
      where: { userId, read: true },
    });

    return { count: result.count };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prismaService.notification.count({
      where: { userId, read: false },
    });

    return { count };
  }

  // Helper methods for specific notification types
  async notifyAppointmentBooked(patientId: string, appointmentId: string, doctorName: string) {
    return this.send({
      userId: patientId,
      type: 'APPOINTMENT',
      title: 'Appointment Booked',
      message: `Your appointment with Dr. ${doctorName} has been booked successfully.`,
      data: { appointmentId },
    });
  }

  async notifyAppointmentReminder(
    patientId: string,
    appointmentId: string,
    doctorName: string,
    time: string,
  ) {
    return this.send({
      userId: patientId,
      type: 'APPOINTMENT',
      title: 'Appointment Reminder',
      message: `Reminder: Your appointment with Dr. ${doctorName} is scheduled for ${time}.`,
      data: { appointmentId },
    });
  }

  async notifyAppointmentCancelled(patientId: string, appointmentId: string, reason: string) {
    return this.send({
      userId: patientId,
      type: 'APPOINTMENT',
      title: 'Appointment Cancelled',
      message: `Your appointment has been cancelled. Reason: ${reason}`,
      data: { appointmentId },
    });
  }

  async notifyPrescriptionCreated(patientId: string, prescriptionId: string, doctorName: string) {
    return this.send({
      userId: patientId,
      type: 'PRESCRIPTION',
      title: 'New Prescription',
      message: `Dr. ${doctorName} has created a new prescription for you.`,
      data: { prescriptionId },
    });
  }

  async notifyOrderUpdate(orderId: string, userId: string, status: string) {
    return this.send({
      userId,
      type: 'ORDER',
      title: 'Order Update',
      message: `Your order #${orderId.substring(0, 8)} status has been updated to: ${status}`,
      data: { orderId },
    });
  }

  async notifyPaymentReceived(userId: string, amount: number, reference: string) {
    return this.send({
      userId,
      type: 'PAYMENT',
      title: 'Payment Received',
      message: `Payment of $${amount} has been received. Reference: ${reference}`,
      data: { reference },
    });
  }

  async notifyClaimUpdate(patientId: string, claimId: string, status: string) {
    return this.send({
      userId: patientId,
      type: 'INSURANCE',
      title: 'Claim Update',
      message: `Your insurance claim status has been updated to: ${status}`,
      data: { claimId },
    });
  }
}
