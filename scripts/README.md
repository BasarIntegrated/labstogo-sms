# Utility Scripts

This directory contains utility scripts for development, testing, and maintenance tasks.

## 📋 Available Scripts

### 🗄️ Database & Setup

- `setup-database.js` - Initialize database schema and tables
- `supabase-setup.js` - Configure Supabase project settings
- `setup-campaigns-table.sql` - SQL script for campaigns table setup

### 🧪 Testing & Verification

- `test-api-endpoints.js` - Test all API endpoints
- `test-patient-creation.js` - Test patient/contact creation
- `test-supabase.js` - Test Supabase connection and queries
- `check-patients.js` - Verify patient data integrity

### 🎯 Campaign Management

- `create-initial-campaign.js` - Create initial campaign templates
- `seed-renewal-campaigns.js` - Seed renewal campaign data

### 🔍 Code Quality

- `code-quality.js` - Run code quality checks and generate reports

## 🚀 Usage

Run scripts using Node.js:

```bash
# Test API endpoints
node scripts/test-api-endpoints.js

# Check patient data
node scripts/check-patients.js

# Create initial campaigns
node scripts/create-initial-campaign.js

# Run code quality checks
node scripts/code-quality.js
```

## 📝 Notes

- All scripts require a running Supabase instance
- Ensure environment variables are properly configured
- Some scripts may require database write permissions
- Test scripts are safe to run in development environments
