# 🔧 System Settings Analysis & Utilization Guide

**Comprehensive overview of System Settings implementation and usage in LabsToGo SMS**

---

## 📋 Overview

The System Settings provide a centralized configuration system stored in the database, allowing administrators to manage application settings through the UI without code changes or deployments.

---

## 🗄️ Database Structure

### Table: `system_settings`

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY,
    category VARCHAR(50) NOT NULL,  -- 'sms', 'email', 'general', 'notifications', 'security'
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,            -- Flexible JSON storage for any value type
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(category, key)
);
```

**Storage Pattern**: Settings are stored as key-value pairs with categories, allowing flexible addition of new settings without schema changes.

---

## 📦 Settings Categories

### 1. **SMS Settings** (`category: 'sms'`)

| Key              | Type    | Description                                               | Encrypted |
| ---------------- | ------- | --------------------------------------------------------- | --------- |
| `provider`       | string  | SMS provider to use (default: "twilio")                   | No        |
| `account_sid`    | string  | Twilio Account SID                                        | Yes       |
| `auth_token`     | string  | Twilio Auth Token                                         | Yes       |
| `from_number`    | string  | Default from phone number                                 | No        |
| `rate_limit`     | number  | Maximum messages per minute (default: 100)                | No        |
| `retry_attempts` | number  | Number of retry attempts for failed messages (default: 3) | No        |
| `sandbox_mode`   | boolean | Enable sandbox mode for testing (default: false)          | No        |

**Current Usage**:

- ✅ Displayed in Settings UI (`/settings`)
- ✅ Used by `SandboxStatus` component to show sandbox mode indicator
- ⚠️ **NOT currently used by backend** - Backend still reads from environment variables

**Backend Integration Gap**: The backend (`labstogo-sms-backend`) currently reads Twilio credentials from environment variables, not from the database settings.

---

### 2. **Email Settings** (`category: 'email'`)

| Key          | Type   | Description                             | Encrypted |
| ------------ | ------ | --------------------------------------- | --------- |
| `provider`   | string | Email provider to use (default: "smtp") | No        |
| `smtp_host`  | string | SMTP server hostname                    | No        |
| `smtp_port`  | number | SMTP port number (default: 587)         | No        |
| `username`   | string | SMTP username                           | No        |
| `password`   | string | SMTP password                           | Yes       |
| `from_email` | string | Default from email address              | No        |

**Current Usage**:

- ✅ Displayed in Settings UI (`/settings`)
- ⚠️ **NOT currently used by backend** - Backend uses SendGrid API key from environment variables

**Backend Integration Gap**: Backend email service uses SendGrid API key from `process.env.SENDGRID_API_KEY`, not database settings.

---

### 3. **General Settings** (`category: 'general'`)

| Key           | Type   | Description                                        | Encrypted |
| ------------- | ------ | -------------------------------------------------- | --------- |
| `app_name`    | string | Application name (default: "LabsToGo SMS Blaster") | No        |
| `timezone`    | string | Default timezone (default: "America/New_York")     | No        |
| `date_format` | string | Default date format (default: "MM/DD/YYYY")        | No        |
| `language`    | string | Default language (default: "en")                   | No        |

**Current Usage**:

- ✅ Displayed in Settings UI (`/settings`)
- ⚠️ **NOT actively used in application** - Stored but not referenced in code

**Potential Usage**: Could be used for:

- App title in page headers
- Date formatting throughout the app
- Timezone conversions for timestamps
- Multi-language support (if implemented)

---

### 4. **Notification Settings** (`category: 'notifications'`)

| Key                   | Type    | 面相                                              | Description | Encrypted |
| --------------------- | ------- | ------------------------------------------------- | ----------- | --------- |
| `email_notifications` | boolean | Enable email notifications (default: true)        | No          |
| `sms_notifications`   | boolean | Enable SMS notifications (default: false)         | No          |
| `campaign_alerts`     | boolean | Enable campaign completion alerts (default: true) | No          |
| `error_alerts`        | boolean | Enable error alerts (default: true)               | No          |

**Current Usage**:

- ✅ Displayed in Settings UI (`/settings`)
- ⚠️ **NOT implemented in application logic** - No notification system uses these settings

**Potential Usage**: Should control:

- Whether to send email notifications for campaign completion
- Whether to send SMS notifications for system alerts
- Campaign completion webhooks/notifications
- Error alerting system

---

### 5. **Security Settings** (`category: 'security'`)

| Key                  | Type    | Description                                        | Encrypted |
| -------------------- | ------- | -------------------------------------------------- | --------- |
| `session_timeout`    | 不及时  | Session timeout in minutes (default: 30)           | No        |
| `require_two_factor` | boolean | Require two-factor authentication (default: false) | No        |
| `max_login_attempts` | number  | Maximum login attempts before lockout (default: 5) | No        |
| `allowed_domains`    | array   | List of allowed email domains                      | No        |

**Current Usage**:

- ✅ Displayed in Settings UI (`/settings`)
- ⚠️ **NOT implemented in authentication logic** - Current auth doesn't use these

**Potential Usage**: Should control:

- JWT token expiration time restriction
- 2FA requirement in login flow
- Login attempt rate limiting
- Email domain validation during registration

---

## 🔄 Data Flow

### **1. Frontend → Database (Save Settings)**

```
User edits settings in UI
  ↓
Settings Page (`src/app/settings/page.tsx`)
  ↓
useSaveSettings() hook (`src/hooks/useSettings.ts`)
  ↓
POST /api/settings
  ↓
transformSettingsToDatabase() - Convert nested object to key-value pairs
  ↓
Supabase upsert - Save each setting as row in system_settings table
  ↓
Database updated ✅
```

### **2. Database → Frontend (Load Settings)**

```
Settings Page loads
  ↓
useSettings() hook (`src/hooks/useSettings.ts`)
  ↓
GET /api/settings
  ↓
Query system_settings table
  ↓
transformDatabaseToSettings() - Convert key-value pairs to nested object
  ↓
mergeWithEnvDefaults() - Merge with environment variables (for sensitive values)
  ↓
Display in UI ✅
```

### **3. Environment Variable Fallback**

The system supports a **hybrid approach**:

- **Sensitive values** (tokens, passwords) can come from environment variables if not set in database
- **Non-sensitive values** come from database settings
- This allows for:
  - Secure credential management via env vars
  - User-configurable settings via database
  - Fallback mechanism if database is unavailable

**Current Behavior**:

```typescript
// If database has no account_sid, fallback to env var
if (process.env.TWILIO_ACCOUNT_SID && !settings.sms.accountSid) {
  settings.sms.accountSid = process.env.TWILIO_ACCOUNT_SID;
}
```

---

## 🔌 API Endpoints

### **GET `/api/settings`**

**Purpose**: Fetch all system settings from database

**Returns**:

```json
{
  "success": true,
  "settings": {
    "sms": { ... },
    "email": { ... },
    "general": { ... },
    "notifications": { ... },
    "security": { ... }
  }
}
```

**Logic**:

1. Query `system_settings` table
2. Transform key-value pairs to nested object
3. Merge with environment variables
4. Return structured settings

### **POST `/api/settings`**

**Purpose**: Save settings to database

**Request Body**:

```json
{
  "settings": {
    "sms": { ... },
    "email": { ... },
    ...
  }
}
```

**Logic**:

1. Transform nested object to key-value pairs
2. Upsert each setting (category + key is unique)
3. Return success/error

---

## 🎯 Current Utilization Status

### ✅ **Implemented & Working**

1. **Settings UI** (`/settings` page)

   - ✅ All settings categories displayed
   - ✅ Save functionality working
   - ✅ Load from database working
   - ✅ Test connection buttons (basic implementation)

2. **Sandbox Status Component**

   - ✅ Reads `sms.sandboxMode` from settings
   - ✅ Displays sandbox mode indicator when enabled

3. **Database Integration**
   - ✅ Settings saved to `system_settings` table
   - ✅ Settings loaded from `system_settings` table
   - ✅ Transform functions working correctly

### ⚠️ **Partially Implemented**

1. **Test Connection Endpoints**
   - ✅ UI calls `/api/settings/test/sms` and `/api/settings/test/email`
   - ⚠️ Endpoints exist but return mock/random results
   - ❌ Not actually testing real connections

### ❌ **Not Implemented / Integration Gaps**

1. **Backend Integration**

   - ❌ Backend doesn't read settings from database
   - ❌ Backend still uses environment variables only
   - ❌ Settings changes don't affect backend behavior

2. **Settings Usage in Application Logic**

   - ❌ General settings (app name, timezone, date format) not used
   - ❌ Notification settings not controlling any notifications
   - ❌ Security settings not affecting authentication/authorization
   - ❌ Rate limits from settings not enforced
   - ❌ Retry attempts from settings not used

3. **Email Settings**
   - ❌ Backend uses SendGrid API key from env, not SMTP settings from database

---

## 🔧 How Settings Are Currently Used

### **1. Frontend Display Only**

Most settings are **only displayed and stored** but not actively used:

```typescript
// Example: Settings are loaded and displayed
const { data: settings } = useSettings();

// But not used in application logic:
// ❌ settings.general.appName - Not used for page titles
// ❌ settings.general.timezone - Not used for date formatting
// ❌ settings.notifications.campaignAlerts - Not checked before sending notifications
// ❌ settings.security.sessionTimeout - Not used in auth logic
```

### **2. Sandbox Mode (Only Active Usage)**

**Location**: `src/components/campaigns/SandboxStatus.tsx`

```typescript
const { data: settings } = useSettings();
const isSandboxMode = settings?.sms?.sandboxMode || ...;
```

**What it does**: Shows a banner/alert when sandbox mode is enabled in settings.

### **3. Environment Variable Hybrid**

Settings API merges database values with environment variables:

```typescript
// If database has no auth_token, use env var (but hide value)
if (process.env.TWILIO_AUTH_TOKEN && !settings.sms.authToken) {
  settings.sms.authToken = "***hidden***";
}
```

This allows:

- Database to store non-sensitive config
- Environment variables to store secrets
- Graceful fallback if database unavailable

---

## 🚨 Key Issues / Integration Gaps

### **Issue 1: Backend Doesn't Read Settings**

**Current State**:

- Frontend saves settings to database ✅
- Backend reads from environment variables only ❌
- Settings changes don't affect backend behavior ❌

**Impact**:

- Changing Twilio credentials in Settings UI doesn't affect SMS sending
- Changing rate limits in Settings doesn't affect message queue processing
- Sandbox mode toggle in UI doesn't affect backend SMS behavior

**Solution Needed**:

- Backend should periodically fetch settings from database OR
- Frontend should sync settings to backend via API OR
- Backend should have an endpoint to push settings updates

### **Issue 2: Settings Not Used in Logic**

**Current State**:

- Settings stored in database ✅
- Settings displayed in UI ✅
- Settings NOT checked/used in application code ❌

**Examples**:

- `notifications.campaignAlerts` - Not checked before sending campaign completion notifications
- `security.sessionTimeout` - Not used to set JWT expiration
- `general.dateFormat` - Not used when formatting dates
- `sms.rateLimit` - Not enforced in message queue processing

**Solution Needed**:

- Integrate settings checks into relevant code paths
- Create utility functions to read settings efficiently
- Cache settings in memory with refresh mechanism

### **Issue 3: Test Connection Endpoints Are Mock**

**Current State**:

- Test buttons exist in UI ✅
- Endpoints return success/failure ✅
- Endpoints don't actually test connections ❌ (random success rate)

**Solution Needed**:

- Implement real connection testing:
  - SMS: Test Twilio API with actual credentials
  - Email: Test SMTP connection with actual credentials
  - Database: Already working (tests Supabase connection)

---

## 💡 Recommendations

### **Priority 1: Backend Integration**

1. **Create Settings API in Backend**

   - Endpoint: `GET /api/settings` to fetch from database
   - Cache settings in memory with TTL (e.g., 5 minutes)
   - Use cached settings instead of env vars

2. **Sync Settings Updates**
   - Option A: Backend polls database periodically
   - Option B: Frontend notifies backend when settings change
   - Option C: Use Redis pub/sub for settings updates

### **Priority 2: Use Settings in Application Logic**

1. **Create Settings Utility**

   ```typescript
   // src/lib/settings.ts
   export async function getSetting(
     category: string,
     key: string
   ): Promise<any>;
   export async function getSettings(category: string): Promise<any>;
   ```

2. **Integrate into Existing Code**
   - Use `sms.rateLimit` in queue processing
   - Use `notifications.*` before sending notifications
   - Use `general.dateFormat` for date formatting
   - Use `security.sessionTimeout` in auth logic

### **Priority 3: Real Connection Testing**

1. **Implement Real Tests**
   ```typescript
   // Test SMS: Try sending test SMS via Twilio
   // Test Email: Try connecting to SMTP server
   // Test Database: Already working
   ```

---

## 📝 Summary

**What Works**:

- ✅ Settings UI and database storage/retrieval
- ✅ Sandbox mode indicator display
- ✅ Environment variable fallback mechanism

**What's Missing**:

- ❌ Backend integration (backend doesn't read settings)
- ❌ Application logic integration (settings not used in code)
- ❌ Real connection testing (endpoints are mock)

**Next Steps**:

1. Integrate backend to read settings from database
2. Use settings values in application logic
3. Implement real connection testing

---

**Last Updated**: 2025-10-29  
**Status**: Settings system is **infrastructure-ready** but needs **application integration**
