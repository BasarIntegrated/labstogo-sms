# 🚀 Message Blasting App - Setup Guide

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project
- Twilio account (for SMS functionality)

## 🔧 Installation Steps

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd message-blasting-app
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Database Setup

#### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and keys from Settings > API

#### Step 2: Apply Database Migration

1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `migrations/007_message_blasting_schema/up.sql`
3. Execute the SQL to create all tables

#### Step 3: Verify Tables

After running the migration, you should have these tables:

- `users` - User authentication
- `contacts` - Contact management (renamed from patients)
- `contact_groups` - Contact organization
- `message_templates` - Reusable message templates
- `campaigns` - Campaign management
- `campaign_recipients` - Individual campaign tracking
- `uploads` - File upload tracking
- `sms_messages` - SMS message history

#### Step 4: Seed Initial Data

```bash
node scripts/seed-renewal-campaigns.js
```

This creates:

- Default admin user (admin@messageblasting.com / admin123)
- Default contact group
- Renewal campaign templates
- Message templates for renewals

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Default Login Credentials

After seeding the database, you can log in with:

- **Admin**: admin@messageblasting.com / admin123
- **User**: user@messageblasting.com / user123 (if created)

## 📱 Features Overview

### Renewal Campaigns

The app comes pre-configured with renewal-focused campaigns:

1. **30-Day License Renewal Reminder**

   - Sent 30 days before license expiration
   - Includes license type, expiration date, and days remaining

2. **7-Day Urgent Renewal Reminder**

   - Urgent reminder for expiring licenses
   - Includes renewal link and contact information

3. **Exam Notification Campaign**

   - Notifications for upcoming professional exams
   - Specialty-specific messaging

4. **License Expiration Notice**
   - Final notice for expired licenses
   - Urgent renewal instructions

### Template Variables

Available merge tags for renewal campaigns:

- `{first_name}` - Contact's first name
- `{last_name}` - Contact's last name
- `{email}` - Contact's email address
- `{phone}` - Contact's phone number
- `{company}` - Contact's company
- `{license_type}` - Type of license
- `{license_expiration_date}` - License expiration date
- `{renewal_deadline}` - Renewal deadline
- `{days_until_expiry}` - Days until license expires
- `{specialty}` - Professional specialty
- `{last_contact_date}` - Last contact date
- `{group}` - Contact group name

## 🚨 Troubleshooting

### Database Connection Issues

- Verify your Supabase URL and keys are correct
- Ensure the migration has been applied successfully
- Check that all tables exist in your Supabase dashboard

### Twilio Configuration

- Verify your Twilio credentials are correct
- Ensure your Twilio phone number is verified
- Check Twilio account balance

### Build Issues

- Run `npm run build` to check for compilation errors
- Ensure all environment variables are set
- Check for TypeScript errors

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Ensure database migration was applied correctly
4. Check environment variables are properly configured

## 🎯 Next Steps

After successful setup:

1. Upload contacts with license information
2. Create contact groups for better organization
3. Customize message templates for your needs
4. Configure Twilio for SMS sending
5. Start creating and sending renewal campaigns
