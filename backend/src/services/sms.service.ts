import axios from 'axios';
import { config } from '../config/env';
import prisma from '../config/database';

const MSG91_BASE_URL = 'https://control.msg91.com/api/v5';

interface SendSMSParams {
  to: string;
  message: string;
  templateId?: string;
}

/**
 * Send SMS using MSG91
 */
export const sendSMS = async ({ to, message, templateId }: SendSMSParams): Promise<boolean> => {
  try {
    // Clean phone number - MSG91 expects without + symbol
    const cleanPhone = to.replace(/\+/g, '');

    // If using template
    if (templateId || config.sms.msg91.templateId) {
      const response = await axios.post(
        `${MSG91_BASE_URL}/flow/`,
        {
          template_id: templateId || config.sms.msg91.templateId,
          sender: config.sms.msg91.senderId,
          short_url: '0',
          mobiles: cleanPhone,
          var1: message, // Message as variable for template
        },
        {
          headers: {
            'authkey': config.sms.msg91.authKey,
            'content-type': 'application/json',
          },
        }
      );

      // Log SMS in database
      await prisma.sMSLog.create({
        data: {
          phone: to,
          message,
          status: response.data.type === 'success' ? 'sent' : 'failed',
          provider: 'msg91',
          providerId: response.data.request_id || response.data.message_id,
        },
      });

      return response.data.type === 'success';
    } else {
      // Direct SMS without template
      const response = await axios.post(
        `${MSG91_BASE_URL}/flow/`,
        {
          sender: config.sms.msg91.senderId,
          route: config.sms.msg91.route,
          country: '91',
          sms: [
            {
              message: message,
              to: [cleanPhone],
            },
          ],
        },
        {
          headers: {
            'authkey': config.sms.msg91.authKey,
            'content-type': 'application/json',
          },
        }
      );

      // Log SMS in database
      await prisma.sMSLog.create({
        data: {
          phone: to,
          message,
          status: response.data.type === 'success' ? 'sent' : 'failed',
          provider: 'msg91',
          providerId: response.data.request_id || response.data.message_id,
        },
      });

      return response.data.type === 'success';
    }
  } catch (error: any) {
    // Log failed SMS
    await prisma.sMSLog.create({
      data: {
        phone: to,
        message,
        status: 'failed',
        provider: 'msg91',
        error: error.response?.data?.message || error.message || 'Unknown error',
      },
    });

    console.error('MSG91 SMS sending failed:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Send OTP using MSG91 OTP API (recommended for OTPs)
 */
export const sendOTPViaMSG91 = async (
  phone: string,
  otp: string,
  templateId?: string
): Promise<boolean> => {
  try {
    const cleanPhone = phone.replace(/\+/g, '');

    if (templateId || config.sms.msg91.otpTemplateId) {
      // Use MSG91 OTP API with template
      const response = await axios.post(
        `${MSG91_BASE_URL}/otp`,
        {
          template_id: templateId || config.sms.msg91.otpTemplateId,
          mobile: cleanPhone,
          otp: otp,
        },
        {
          headers: {
            'authkey': config.sms.msg91.authKey,
            'content-type': 'application/json',
          },
        }
      );

      await prisma.sMSLog.create({
        data: {
          phone: phone,
          message: `OTP: ${otp}`,
          status: response.data.type === 'success' ? 'sent' : 'failed',
          provider: 'msg91',
          providerId: response.data.request_id,
        },
      });

      return response.data.type === 'success';
    } else {
      // Fallback to regular SMS if no OTP template configured
      return sendSMS({
        to: phone,
        message: `Your OTP is: ${otp}. Valid for 15 minutes. Do not share with anyone.`
      });
    }
  } catch (error: any) {
    console.error('MSG91 OTP sending failed:', error.response?.data || error.message);

    // Fallback to regular SMS
    return sendSMS({
      to: phone,
      message: `Your OTP is: ${otp}. Valid for 15 minutes. Do not share with anyone.`
    });
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
  companyName: string = 'Concreexpo'
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
  purpose: string,
  companyName: string = 'Concreexpo'
): Promise<boolean> => {
  const message = `New appointment: Client ${clientName}, Date: ${date} ${time}, Location: ${location}, Purpose: ${purpose}. Check dashboard for details. - ${companyName}`;
  return sendSMS({ to: engineerPhone, message });
};

/**
 * Send OTP for visit verification
 */
export const sendVisitOTP = async (
  clientPhone: string,
  otp: string,
  engineerName: string,
  companyName: string = 'Concreexpo'
): Promise<boolean> => {
  const message = `Your OTP for visit verification with ${engineerName} is: ${otp}. Valid for 15 minutes. Share this with the engineer. - ${companyName}`;

  // Try using MSG91 OTP API first, fallback to regular SMS
  const otpSent = await sendOTPViaMSG91(clientPhone, otp);

  // If OTP API fails, try regular SMS with custom message
  if (!otpSent) {
    return sendSMS({ to: clientPhone, message });
  }

  return otpSent;
};

/**
 * Send OTP for worker count verification (to client)
 */
export const sendWorkerCountOTPToClient = async (
  clientPhone: string,
  otp: string,
  siteName: string,
  date: string,
  companyName: string = 'Concreexpo'
): Promise<boolean> => {
  const message = `Worker count verification for ${siteName} on ${date}. Your OTP is: ${otp}. Valid for 24 hours. - ${companyName}`;

  // Try using MSG91 OTP API first
  const otpSent = await sendOTPViaMSG91(clientPhone, otp);

  if (!otpSent) {
    return sendSMS({ to: clientPhone, message });
  }

  return otpSent;
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
  companyName: string = 'Concreexpo'
): Promise<boolean> => {
  const message = `Worker visit created by ${engineerName} for ${clientName} on ${date}. Verification OTP: ${otp}. - ${companyName}`;
  return sendSMS({ to: adminPhone, message });
};

/**
 * Check MSG91 balance (useful for monitoring)
 */
export const checkMSG91Balance = async (): Promise<any> => {
  try {
    const response = await axios.get(
      `${MSG91_BASE_URL}/balance`,
      {
        headers: {
          'authkey': config.sms.msg91.authKey,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to check MSG91 balance:', error.response?.data || error.message);
    return null;
  }
};
