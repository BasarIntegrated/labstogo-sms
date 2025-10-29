# Backend Email Worker Requirements

## Current Issue
Email messages are being created with `status='pending'` in the `email_messages` table, but the backend email worker is not processing them.

## Required Implementation

The backend email worker needs to poll the `email_messages` table for records with `status='pending'` and process them. This should work similarly to how the SMS worker processes pending SMS messages.

### Implementation Steps

1. **Poll the Database Periodically**
   - Query `email_messages` table for records where `status = 'pending'`
   - Order by `created_at` ASC (process oldest first)
   - Limit batch size (e.g., 10-50 messages per poll)

2. **Process Each Email Message**
   - For each pending email:
     - Update status to 'processing' (or lock the record)
     - Send email via email provider (SendGrid, AWS SES, etc.)
     - Update status tom 'sent' on success
     - Store `provider_message_id` and `provider_response`
     - Set `sent_at` timestamp
     - On failure, set status to 'failed' and store error details

3. **Polling Interval**
   - Recommended: Every 5-10 seconds
   - Use setInterval or a similar mechanism

### Example Query

```sql
SELECT * FROM email_messages 
WHERE status = 'pending' 
ORDER BY created_at ASC 
LIMIT 50;
```

### Expected Database Updates

When processing an email message:

```sql
UPDATE email_messages 
SET 
  status = 'sent',
  provider_message_id = '...',
  provider_response = '...',
  sent_at = NOW(),
  updated_at = NOW()
WHERE id = '...';
```

### Error Handling

On failure:
```sql
UPDATE email_messages 
SET 
  status = 'failed',
  failed_at = NOW(),
  error_message = '...',
  retry_count = retry_count + 1,
  last_retry_at = NOW(),
  updated_at = NOW()
WHERE id = '...';
```

### API Endpoint for Manual Trigger (Optional)

If implementing the `/api/process-pending-emails` endpoint:
- This endpoint can manually trigger immediate processing of pending emails
- Useful for testing or immediate processing after message creation
- Should query and process pending emails similar to the polling logic

### Monitoring

Log successful processing:
```
✅ Processed email message {id} for {email}
```

Log errors:
```
❌ Failed to process email message {id}: {error}
```

## Current Status

The frontend is now calling `/api/process-pending-emails` when email messages are created, but this endpoint may not exist yet on the backend. If the endpoint doesn't exist, the backend worker should still poll the database automatically.

