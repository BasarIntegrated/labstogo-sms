# Twilio Sandbox Setup Guide

This guide explains how to set up Twilio Sandbox mode for development and testing.

## What is Twilio Sandbox?

Twilio Sandbox is a free testing environment that allows you to:
- Send SMS messages without charges
- Test your SMS functionality safely
- Use verified phone numbers only
- Get familiar with Twilio's API

## Setup Instructions

1. **Get Twilio Credentials:**
   - Go to [Twilio Console](https://console.twilio.com/)
   - Copy your Account SID and Auth Token

2. **Create `.env.local` file:**

   ```env
   # Twilio Sandbox Configuration
   TWILIO_SANDBOX_MODE=true
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   NODE_ENV=development
   ```

3. **Verify Phone Numbers:**
   - In Twilio Console, go to Phone Numbers → Manage → Verified Caller IDs
   - Add the phone numbers you want to test with
   - Only verified numbers can receive SMS in sandbox mode

## Sandbox Features

✅ **Free SMS sending** - No charges for messages
✅ **Verified numbers only** - Only sends to verified phone numbers
✅ **Full API functionality** - Same API as production
✅ **Message prefixing** - Messages are prefixed with `[SANDBOX]`
✅ **Error handling** - Helpful error messages for unverified numbers
✅ **Catch-all recipient** - All SMS routed to verified numbers for testing

## Testing Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test SMS sending:**
   - Go to the SMS testing page
   - Send a test message to a verified number
   - Check that the message is received

3. **Check logs:**
   - Look for `🧪 Twilio Sandbox Mode` messages in console
   - Verify that messages are being sent successfully

## Important Notes

- **Phone Number Verification Required**: Only verified phone numbers can receive SMS
- **Message Prefixing**: All messages will be prefixed with `[SANDBOX]`
- **No Charges**: SMS sending is completely free in sandbox mode
- **Rate Limits**: Sandbox has generous rate limits for testing

## Troubleshooting

### Common Issues

1. **"The number is not verified"**
   - Solution: Add the phone number to verified caller IDs in Twilio Console

2. **"Authentication failed"**
   - Solution: Check your Account SID and Auth Token in `.env.local`

3. **"Invalid phone number format"**
   - Solution: Use E.164 format (+1234567890)

### Getting Help

- [Twilio Sandbox Documentation](https://www.twilio.com/docs/verify/sandbox)
- [Twilio Console](https://console.twilio.com/)
- [Twilio Support](https://support.twilio.com/)

## Production Deployment

When ready for production:

1. **Disable sandbox mode:**
   ```env
   TWILIO_SANDBOX_MODE=false
   ```

2. **Use production credentials:**
   - Get production Account SID and Auth Token
   - Purchase a Twilio phone number

3. **Update phone number:**
   ```env
   TWILIO_PHONE_NUMBER=your_production_phone_number
   ```

4. **Test thoroughly:**
   - Send test messages to real numbers
   - Verify delivery and formatting
   - Check billing and usage

## Security Best Practices

- Never commit credentials to version control
- Use environment variables for all sensitive data
- Rotate credentials regularly
- Monitor usage and billing
- Use webhooks for delivery status updates
