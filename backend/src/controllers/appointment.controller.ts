import { Request, Response } from 'express';
import prisma from '../config/database';
import { generateOTP, getOTPExpiry, isOTPExpired } from '../utils/otp';
import {
  sendAppointmentNotification,
  sendAppointmentNotificationToEngineer,
  sendVisitOTP,
} from '../services/sms.service';
import { format } from 'date-fns';

/**
 * Get all appointments (Admin: all, Engineer: own only)
 */
export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, engineerId, clientId, dateFrom, dateTo } = req.query;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const where: any = {};

    // Engineers can only see their own appointments
    if (userRole === 'ENGINEER') {
      where.engineerId = userId;
    }

    // Apply filters
    if (status) {
      where.status = status as string;
    }

    if (engineerId && userRole === 'ADMIN') {
      where.engineerId = engineerId as string;
    }

    if (clientId) {
      where.clientId = clientId as string;
    }

    if (dateFrom || dateTo) {
      where.visitDate = {};
      if (dateFrom) {
        where.visitDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.visitDate.lte = new Date(dateTo as string);
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          engineer: {
            select: {
              id: true,
              name: true,
              email: true,
              mobileNumber: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              primaryContact: true,
              address: true,
            },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: {
          visitDate: 'desc',
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

/**
 * Get single appointment by ID
 */
export const getAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        engineer: {
          select: {
            id: true,
            name: true,
            email: true,
            mobileNumber: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            primaryContact: true,
            secondaryContact: true,
            address: true,
          },
        },
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Engineers can only view their own appointments
    if (userRole === 'ENGINEER' && appointment.engineerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

/**
 * Create new appointment (Admin only)
 */
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      engineerId,
      clientId,
      purpose,
      visitDate,
      siteAddress,
      otpMobileNumber,
    } = req.body;

    // Validate required fields (only engineerId, clientId, and visitDate are required)
    if (!engineerId || !clientId || !visitDate) {
      res.status(400).json({ error: 'Engineer, client, and visit date are required' });
      return;
    }

    // Validate engineer exists and is active
    const engineer = await prisma.user.findFirst({
      where: { id: engineerId, role: 'ENGINEER', isActive: true },
    });

    if (!engineer) {
      res.status(404).json({ error: 'Engineer not found or inactive' });
      return;
    }

    // Validate client exists and is active
    const client = await prisma.client.findFirst({
      where: { id: clientId, isActive: true },
      include: { clientType: true },
    });

    if (!client) {
      res.status(404).json({ error: 'Client not found or inactive' });
      return;
    }

    // Validate visit date is not in the past (allow same day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitDateObj = new Date(visitDate);
    visitDateObj.setHours(0, 0, 0, 0);

    if (visitDateObj < today) {
      res.status(400).json({ error: 'Visit date cannot be in the past' });
      return;
    }

    // Validate OTP mobile number if provided
    if (otpMobileNumber && !/^\+?\d{10,}$/.test(otpMobileNumber)) {
      res.status(400).json({ error: 'Invalid OTP mobile number' });
      return;
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        engineerId,
        clientId,
        purpose,
        visitDate: new Date(visitDate),
        siteAddress,
        otpMobileNumber,
        status: 'SCHEDULED',
      },
      include: {
        engineer: true,
        client: true,
      },
    });

    // Send SMS notifications
    const dateStr = format(new Date(visitDate), 'MMM dd, yyyy');
    const timeStr = format(new Date(visitDate), 'hh:mm a');

    // Send to client's primary contact
    await sendAppointmentNotification(
      client.primaryContact,
      engineer.name,
      dateStr,
      timeStr,
      siteAddress || client.address || 'Not specified'
    );

    // Send to engineer
    await sendAppointmentNotificationToEngineer(
      engineer.mobileNumber,
      client.name,
      dateStr,
      timeStr,
      siteAddress || client.address || 'Not specified',
      purpose || 'Visit scheduled'
    );

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

/**
 * Update appointment (Admin only)
 */
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { visitDate, siteAddress, purpose, otpMobileNumber } = req.body;

    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Cannot update completed appointments
    if (existing.status === 'COMPLETED') {
      res.status(400).json({ error: 'Cannot update completed appointment' });
      return;
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        visitDate: visitDate ? new Date(visitDate) : undefined,
        siteAddress,
        purpose,
        otpMobileNumber,
      },
      include: {
        engineer: true,
        client: true,
      },
    });

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

/**
 * Cancel appointment (Admin only)
 */
export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    if (appointment.status === 'COMPLETED') {
      res.status(400).json({ error: 'Cannot cancel completed appointment' });
      return;
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

/**
 * Get engineer's dashboard appointments
 * Shows all non-cancelled, non-completed appointments
 */
export const getEngineerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const appointments = await prisma.appointment.findMany({
      where: {
        engineerId: userId,
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            primaryContact: true,
            address: true,
          },
        },
      },
      orderBy: {
        visitDate: 'asc',
      },
    });

    res.json({ data: appointments });
  } catch (error) {
    console.error('Get engineer dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

/**
 * Send OTP for appointment verification (Engineer only)
 */
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        engineer: true,
        client: true,
      },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Verify engineer owns this appointment
    if (appointment.engineerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check appointment status
    if (appointment.status === 'COMPLETED') {
      res.status(400).json({ error: 'Appointment already completed' });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Determine recipient: otpMobileNumber if provided, else client's primary contact
    const recipientPhone = appointment.otpMobileNumber || appointment.client.primaryContact;

    // Send OTP SMS
    await sendVisitOTP(recipientPhone, otp, appointment.engineer.name);

    // Update appointment
    await prisma.appointment.update({
      where: { id },
      data: {
        otp,
        otpExpiresAt: otpExpiry,
        otpSentAt: new Date(),
        otpAttempts: 0,
        status: 'OTP_SENT',
      },
    });

    res.json({
      message: 'OTP sent successfully',
      sentTo: recipientPhone,
      expiresAt: otpExpiry,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

/**
 * Verify OTP (Engineer only)
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const userId = req.user?.userId;

    if (!otp) {
      res.status(400).json({ error: 'OTP is required' });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Verify engineer owns this appointment
    if (appointment.engineerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check if OTP was sent
    if (!appointment.otp || !appointment.otpExpiresAt) {
      res.status(400).json({ error: 'OTP not sent yet' });
      return;
    }

    // Check if OTP expired
    if (isOTPExpired(appointment.otpExpiresAt)) {
      res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      return;
    }

    // Check OTP attempts limit
    if (appointment.otpAttempts >= 3) {
      res.status(400).json({ error: 'Maximum OTP attempts exceeded. Please request a new OTP.' });
      return;
    }

    // Verify OTP
    if (appointment.otp !== otp) {
      // Increment failed attempts
      await prisma.appointment.update({
        where: { id },
        data: {
          otpAttempts: appointment.otpAttempts + 1,
        },
      });

      res.status(400).json({
        error: 'Invalid OTP',
        attemptsRemaining: 2 - appointment.otpAttempts,
      });
      return;
    }

    // Update appointment status
    await prisma.appointment.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        otpAttempts: appointment.otpAttempts + 1,
      },
    });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

/**
 * Submit feedback after verification (Engineer only)
 */
export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const userId = req.user?.userId;

    if (!feedback || feedback.trim().length < 10) {
      res.status(400).json({ error: 'Feedback must be at least 10 characters' });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    // Verify engineer owns this appointment
    if (appointment.engineerId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Must be verified first
    if (appointment.status !== 'VERIFIED') {
      res.status(400).json({ error: 'Appointment must be verified first' });
      return;
    }

    // Update with feedback and mark complete
    await prisma.appointment.update({
      where: { id },
      data: {
        feedback: feedback.trim(),
        status: 'COMPLETED',
      },
    });

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

/**
 * Get appointment reports (Admin only)
 */
export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo, engineerId, clientId, status } = req.query;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.visitDate = {};
      if (dateFrom) {
        where.visitDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.visitDate.lte = new Date(dateTo as string);
      }
    }

    if (engineerId) {
      where.engineerId = engineerId as string;
    }

    if (clientId) {
      where.clientId = clientId as string;
    }

    if (status) {
      where.status = status as string;
    }

    const [appointments, summary] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          engineer: {
            select: {
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              name: true,
              primaryContact: true,
            },
          },
        },
        orderBy: {
          visitDate: 'desc',
        },
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    const summaryObj = summary.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      data: appointments,
      summary: {
        total: appointments.length,
        completed: summaryObj.COMPLETED || 0,
        verified: summaryObj.VERIFIED || 0,
        otpSent: summaryObj.OTP_SENT || 0,
        scheduled: summaryObj.SCHEDULED || 0,
        cancelled: summaryObj.CANCELLED || 0,
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
};
