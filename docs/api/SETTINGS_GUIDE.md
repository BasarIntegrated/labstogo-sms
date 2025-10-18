# 🔧 Settings System Guide

## Overview

The LabsToGo SMS Blaster includes a comprehensive settings system for configuring various aspects of the application. The settings are organized into logical categories and can be managed through both the UI and API.

## 🏗️ Architecture

### Frontend Components

- **Settings Page** (`/src/app/settings/page.tsx`) - Main settings interface
- **Settings Hook** (`/src/hooks/useSettings.ts`) - React Query hooks for data management
- **Settings Types** - TypeScript interfaces for type safety

### Backend API

- **Settings API** (`/src/app/api/settings/route.ts`) - CRUD operations for settings
- **Test Connection API** (`/src/app/api/settings/test/[type]/route.ts`) - Connection testing
- **Database Schema** (`settings-schema.sql`) - Database structure

## 📋 Settings Categories

### 1. General Settings

- **Application Name** - Display name for the app
- **Timezone** - Default timezone for the system
- **Date Format** - How dates are displayed
- **Language** - Default language setting

### 2. SMS Settings

- **Provider** - SMS service provider (Twilio, AWS SNS, SendGrid)
- **Account SID** - Provider account identifier
- **Auth Token** - Provider authentication token
- **From Number** - Default sender phone number
- **Rate Limit** - Messages per minute limit
- **Retry Attempts** - Number of retry attempts for failed messages

### 3. Email Settings

- **SMTP Host** - Email server hostname
- **SMTP Port** - Email server port
- **Username** - SMTP authentication username
- **Password** - SMTP authentication password
- **From Email** - Default sender email address

### 4. Notification Settings

- **Email Notifications** - Enable/disable email notifications
- **SMS Notifications** - Enable/disable SMS notifications
- **Campaign Alerts** - Notifications for campaign completion
- **Error Alerts** - Notifications for system errors

### 5. Security Settings

- **Session Timeout** - User session duration in minutes
- **Two-Factor Authentication** - Require 2FA for all users
- **Max Login Attempts** - Maximum failed login attempts
- **Allowed Domains** - Whitelist of email domains

### 6. Database Settings

- **Connection Status** - Database connectivity status
- **Provider Info** - Database provider details

## 🚀 Usage

### Accessing Settings

1. Navigate to `/settings` in the application
2. Use the sidebar to switch between different setting categories
3. Modify values as needed
4. Click "Save Settings" to persist changes

### Testing Connections

1. Go to SMS, Email, or Database settings
2. Click "Test Connection" button
3. Wait for the test to complete
4. View results (success/error indicators)

### API Usage

#### Get Settings

```typescript
const response = await fetch("/api/settings");
const { settings } = await response.json();
```

#### Save Settings

```typescript
const response = await fetch("/api/settings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ settings: newSettings }),
});
```

#### Test Connection

```typescript
const response = await fetch("/api/settings/test/sms", {
  method: "POST",
});
```

## 🗄️ Database Schema

### Settings Table Structure

```sql
CREATE TABLE system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);
```

### Default Settings

The system comes with sensible defaults for all settings categories. These are automatically inserted when the database schema is created.

## 🔒 Security Considerations

### Sensitive Data

- **Passwords and tokens** are masked in the UI (`***hidden***`)
- **Encryption** can be enabled for sensitive settings
- **Environment variables** are used for production secrets

### Access Control

- **Row Level Security (RLS)** is enabled on the settings table
- **Policies** can be configured based on user roles
- **API endpoints** should be protected with authentication

## 🧪 Testing

### Connection Tests

- **SMS Provider** - Tests Twilio/other provider connectivity
- **Email Server** - Tests SMTP server connection
- **Database** - Tests Supabase connection

### Mock Responses

For development, connection tests return mock results with realistic success/failure rates.

## 🔄 Environment Variables

### Required Variables

```bash
# SMS Settings
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890

# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@yourdomain.com

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📝 Customization

### Adding New Settings

1. **Update TypeScript interfaces** in the settings page
2. **Add UI components** for the new setting
3. **Update API endpoints** to handle the new setting
4. **Add database migration** if needed
5. **Update default values** in the schema

### Adding New Categories

1. **Create new tab** in the settings navigation
2. **Add category section** in the settings content
3. **Update TypeScript interfaces**
4. **Add database entries** for default values

## 🐛 Troubleshooting

### Common Issues

- **Settings not saving** - Check API endpoint and database connection
- **Connection tests failing** - Verify credentials and network connectivity
- **UI not updating** - Check React Query cache invalidation
- **Type errors** - Ensure TypeScript interfaces are up to date

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` to see detailed API responses and error messages.

## 📚 Related Files

- `src/app/settings/page.tsx` - Main settings interface
- `src/hooks/useSettings.ts` - React Query hooks
- `src/app/api/settings/route.ts` - Settings API
- `src/app/api/settings/test/[type]/route.ts` - Connection testing
- `settings-schema.sql` - Database schema
- `SETTINGS_GUIDE.md` - This documentation

## 🎯 Future Enhancements

- **User-specific settings** - Per-user configuration overrides
- **Settings validation** - Real-time validation of setting values
- **Settings history** - Track changes over time
- **Bulk import/export** - Settings backup and restore
- **Advanced security** - Encryption for sensitive settings
- **Settings templates** - Pre-configured setting profiles
