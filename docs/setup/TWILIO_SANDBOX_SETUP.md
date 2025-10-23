# Twilio Sandbox Setup

Quick setup guide for Twilio Sandbox mode in development.

## Environment Variables

Add these to your `.env.local`:

```env
# Twilio Sandbox Configuration
TWILIO_SANDBOX_MODE=true
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Note: In sandbox mode, TWILIO_PHONE_NUMBER is set to +639221200726 (custom sender)
# All SMS will be routed to +639688800575 (catch-all recipient)
```

### Sandbox Features

✅ **Free SMS sending** - No charges for messages
✅ **Verified numbers only** - Only sends to verified phone numbers
✅ **Full API functionality** - Same API as production
✅ **Message prefixing** - Messages are prefixed with `[SANDBOX]`
✅ **Error handling** - Helpful error messages for unverified numbers
✅ **Catch-all recipient** - All SMS routed to +639688800575 for testing

## Quick Start

1. **Get Twilio credentials** from [Twilio Console](https://console.twilio.com/)
2. **Add credentials** to `.env.local` (replace placeholder values)
3. **Verify phone numbers** in Twilio Console → Phone Numbers → Verified Caller IDs
4. **Start development server**: `npm run dev`
5. **Test SMS sending** to verified numbers only

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

## Development Workflow

1. **Start with sandbox mode** for development
2. **Test with verified numbers** only
3. **Use message prefixing** to identify test messages
4. **Monitor console logs** for sandbox mode indicators
5. **Switch to production** when ready for deployment

## Testing Checklist

- [ ] Twilio credentials configured
- [ ] Phone numbers verified in Twilio Console
- [ ] Sandbox mode enabled (`TWILIO_SANDBOX_MODE=true`)
- [ ] Test SMS sent successfully
- [ ] Message received with `[SANDBOX]` prefix
- [ ] Error handling works for unverified numbers
- [ ] Console shows sandbox mode indicators

## API Usage Examples

### Basic SMS Sending
```javascript
// SMS will be sent to verified numbers only
const message = await twilio.messages.create({
  body: 'Hello from Twilio Sandbox!',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+1234567890' // Must be verified
});
```

### Error Handling
```javascript
try {
  const message = await twilio.messages.create({
    body: 'Test message',
    from: process.env.TWILIO_PHONE_NUMBER,
    to: '+1234567890'
  });
} catch (error) {
  if (error.code === 21211) {
    console.log('Phone number not verified');
  }
}
```

## Monitoring and Logging

- **Console Logs**: Look for `🧪 Twilio Sandbox Mode` messages
- **Message Status**: Check delivery status in Twilio Console
- **Error Tracking**: Monitor failed message attempts
- **Usage Monitoring**: Track message volume and patterns
