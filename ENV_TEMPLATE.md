# Environment Variables Template

Copy these templates and fill in your actual values for deployment.

## Backend Environment Variables (Railway)

```env
# Database
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app

# JWT Secrets (Generate using: openssl rand -base64 32)
JWT_SECRET=your-generated-secret-here-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-generated-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=30d

# SMS (MSG91)
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your_msg91_auth_key_here
MSG91_SENDER_ID=CNCEXP
MSG91_ROUTE=4
MSG91_TEMPLATE_ID=your_template_id_here
MSG91_OTP_TEMPLATE_ID=your_otp_template_id_here

# Admin Credentials
ADMIN_EMAIL=admin@wallfloor.com
ADMIN_PASSWORD=Admin@123456
ADMIN_PHONE=+919876543210

# Rate Limiting (Optional - defaults shown)
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
OTP_RATE_LIMIT_MAX=5

# OTP Settings (Optional - defaults shown)
OTP_EXPIRY_MINUTES=15
OTP_LENGTH=6
WORKER_VISIT_OTP_EXPIRY_HOURS=24
```

## Frontend Environment Variables (Vercel)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api

# Feature Flags (Optional - all default to true if not set)
NEXT_PUBLIC_FEATURE_DASHBOARD=true
NEXT_PUBLIC_FEATURE_APPOINTMENTS=true
NEXT_PUBLIC_FEATURE_INVENTORY=true
NEXT_PUBLIC_FEATURE_WORKER_COUNTS=true
NEXT_PUBLIC_FEATURE_REPORTS=true
NEXT_PUBLIC_FEATURE_CLIENTS=true
NEXT_PUBLIC_FEATURE_ENGINEERS=true
NEXT_PUBLIC_FEATURE_MATERIALS=true
NEXT_PUBLIC_FEATURE_SETTINGS=true
```

## How to Generate JWT Secrets

### Linux/Mac:
```bash
openssl rand -base64 32
```

### Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Online (Alternative):
Visit: https://generate-secret.vercel.app/32

## Important Notes

1. **Never commit these values to Git** - They should only be in your hosting platform's environment variables
2. **Use different secrets for production** - Don't reuse development secrets
3. **Keep secrets secure** - Treat them like passwords
4. **Update FRONTEND_URL** in backend after frontend is deployed
5. **Update NEXT_PUBLIC_API_URL** in frontend after backend is deployed

