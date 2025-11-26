# MSG91 OTP Widget Integration Guide

## Overview
This project uses MSG91 OTP Widget service instead of direct SMS API to avoid DLT registration costs. The widget handles OTP sending and verification on the frontend, while the backend generates and verifies JWT tokens.

## What You Need from MSG91

1. **MSG91 Auth Key** (Already have this)
   - Your existing `MSG91_AUTH_KEY` from MSG91 dashboard
   - Location: MSG91 Dashboard → API → Auth Key

2. **MSG91 OTP Widget Script**
   - You need to get the widget script URL from MSG91
   - Typically: `https://widget.msg91.com/otp-widget/otp-widget.js` or similar
   - Check MSG91 documentation for the exact widget script URL

3. **Widget Configuration** (Optional)
   - Widget theme/styling options
   - Customization settings if needed

## Environment Variables Required

Add/Update these in your `.env` file:

```env
# MSG91 Configuration
MSG91_AUTH_KEY=your_auth_key_here  # Already have this
MSG91_OTP_WIDGET_SCRIPT_URL=https://widget.msg91.com/otp-widget/otp-widget.js  # Get from MSG91 docs
```

## How It Works

### Flow:
1. **Backend generates JWT token** for the OTP widget with phone number and appointment/visit ID
2. **Frontend receives token** and initializes MSG91 OTP widget with the token
3. **Widget sends OTP** to the phone number automatically
4. **User enters OTP** in the widget
5. **Widget verifies OTP** and returns an access token (JWT from MSG91)
6. **Frontend sends access token** to backend
7. **Backend verifies** the access token with MSG91 API
8. **Backend updates** appointment/visit status

### Backend Endpoints:

#### Appointments:
- `GET /api/appointments/:id/otp-widget-token` - Generate widget token
- `POST /api/appointments/:id/verify-otp-widget` - Verify OTP with widget token

#### Worker Visits:
- `GET /api/worker-visits/:id/otp-widget-token` - Generate widget token
- `POST /api/worker-visits/:id/submit-count-widget` - Submit count with widget verification

## Frontend Integration

The frontend needs to:
1. Load MSG91 OTP Widget script
2. Initialize widget with token from backend
3. Handle widget callbacks
4. Send verified access token to backend

## Next Steps

1. **Get Widget Script URL from MSG91**
   - Contact MSG91 support or check their documentation
   - Get the exact script URL for the OTP widget

2. **Test the Integration**
   - Use the widget in development
   - Verify OTP sending and verification works

3. **Update Frontend Components**
   - Replace manual OTP input with widget
   - Update appointments and worker visits pages

## Notes

- The widget handles OTP sending automatically, so no need for manual SMS sending
- DLT registration is not required when using the widget
- The widget provides a better UX with built-in OTP input and verification
- Backend still validates the access token for security


