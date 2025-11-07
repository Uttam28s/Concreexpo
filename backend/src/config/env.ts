import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // SMS (Twilio)
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER!,
    },
  },

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
    phone: process.env.ADMIN_PHONE!,
  },

  // Rate Limiting
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    otpMax: parseInt(process.env.OTP_RATE_LIMIT_MAX || '5', 10),
  },

  // OTP
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '15', 10),
    length: parseInt(process.env.OTP_LENGTH || '6', 10),
    workerVisitExpiryHours: parseInt(process.env.WORKER_VISIT_OTP_EXPIRY_HOURS || '24', 10),
  },
};
