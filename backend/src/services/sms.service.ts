import twilio from 'twilio';
import { config } from '../config/env';
import prisma from '../config/database';

const twilioClient = twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);

interface SendSMSParams {
  to: string;
  message: string;
}

/**
 * Send SMS using Twilio
 */
export const sendSMS = async ({ to, message }: SendSMSParams): Promise<boolean> => {
  try {
    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: config.sms.twilio.phoneNumber,
      to: to,
    });

    // Log SMS in database
    await prisma.sMSLog.create({
      data: {
        phone: to,
        message,
        status: 'sent',
        provider: 'twilio',
        providerId: result.sid,
      },
    });

    return true;
  } catch (error: any) {
    // Log failed SMS
    await prisma.sMSLog.create({
      data: {
        phone: to,
        message,
        status: 'failed',
        provider: 'twilio',
        error: error.message || 'Unknown error',
      },
    });

    console.error('SMS sending failed:', error);
    return false;
  }
};

/**
 * Send appointment notification to client
 */
export const sendAppointmentNotification = async (
  clientPhone: string,
  engineerName: string,
  date: string,
  time: string,
  location: string,
  companyName: string = 'WallFloor'
): Promise<boolean> => {
  const message = `Appointment scheduled with ${engineerName} on ${date} at ${time}. Location: ${location}. You will receive an OTP after the visit for verification. - ${companyName}`;
  return sendSMS({ to: clientPhone, message });
};

/**
 * Send appointment notification to engineer
 */
export const sendAppointmentNotificationToEngineer = async (
  engineerPhone: string,
  clientName: string,
  date: string,
  time: string,
  location: string,
  attendeeName: string,
  companyName: string = 'WallFloor'
): Promise<boolean> => {
  const message = `New appointment: Client ${clientName}, Date: ${date} ${time}, Location: ${location}, Attendee: ${attendeeName}. Check dashboard for details. - ${companyName}`;
  return sendSMS({ to: engineerPhone, message });
};

/**
 * Send OTP for visit verification
 */
export const sendVisitOTP = async (
  clientPhone: string,
  otp: string,
  engineerName: string,
  companyName: string = 'WallFloor'
): Promise<boolean> => {
  const message = `Your OTP for visit verification with ${engineerName} is: ${otp}. Valid for 15 minutes. Share this with the engineer. - ${companyName}`;
  return sendSMS({ to: clientPhone, message });
};

/**
 * Send OTP for worker count verification (to client)
 */
export const sendWorkerCountOTPToClient = async (
  clientPhone: string,
  otp: string,
  siteName: string,
  date: string,
  companyName: string = 'WallFloor'
): Promise<boolean> => {
  const message = `Worker count verification for ${siteName} on ${date}. Your OTP is: ${otp}. Valid for 24 hours. - ${companyName}`;
  return sendSMS({ to: clientPhone, message });
};

/**
 * Send OTP for worker count verification (to admin)
 */
export const sendWorkerCountOTPToAdmin = async (
  adminPhone: string,
  otp: string,
  engineerName: string,
  clientName: string,
  date: string,
  companyName: string = 'WallFloor'
): Promise<boolean> => {
  const message = `Worker visit created by ${engineerName} for ${clientName} on ${date}. Verification OTP: ${otp}. - ${companyName}`;
  return sendSMS({ to: adminPhone, message });
};
