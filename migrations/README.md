# 🗄️ Database Migrations

This directory contains database migrations for the LabsToGo SMS Blaster application.

## 📁 Structure

```
migrations/
├── 001_initial_schema/
│   ├── up.sql      # Create initial tables
│   └── down.sql    # Rollback initial tables
├── 002_settings_schema/
│   ├── up.sql      # Add system settings table
│   └── down.sql    # Rollback settings table
├── 003_leads_update/
│   ├── up.sql      # Update leads table structure
│   └── down.sql    # Rollback leads changes
└── README.md       # This file
```

## 🚀 Running Migrations

### Prerequisites

1. Ensure your `.env.local` file contains:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Commands

#### Run All Migrations

```bash
node scripts/migrate.js up
```

#### Run Specific Migration

```bash
node scripts/migrate.js up 001_initial_schema
```

#### Rollback Migration

```bash
node scripts/migrate.js down 001_initial_schema
```

## 📋 Migration Details

### 001_initial_schema

- **Purpose**: Creates the core database schema
- **Tables**: `leads`, `campaigns`, `sms_messages`, `job_queue`
- **Features**: Indexes, triggers, RLS policies

### 002_settings_schema

- **Purpose**: Adds system configuration table
- **Tables**: `system_settings`
- **Features**: Default settings, category-based organization

### 003_leads_update

- **Purpose**: Updates leads table for CSV compatibility
- **Changes**: Column renames, structure updates
- **Features**: Maintains data integrity

## 🔧 Manual Migration

If you prefer to run migrations manually in Supabase:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `up.sql` files in order
4. Execute each migration

## ⚠️ Important Notes

- **Always backup your database** before running migrations
- **Test migrations in development** before production
- **Run migrations in order** (001, 002, 003...)
- **Check for conflicts** if you've made manual schema changes

## 🐛 Troubleshooting

### Common Issues

1. **Permission Errors**

   - Ensure `SUPABASE_SERVICE_ROLE_KEY` has admin privileges
   - Check RLS policies if you get access denied errors

2. **Migration Conflicts**

   - Check if tables already exist
   - Use `IF NOT EXISTS` clauses in SQL
   - Consider manual cleanup before re-running

3. **Rollback Issues**
   - Some changes cannot be easily rolled back
   - Always test rollbacks in development first

### Getting Help

- Check Supabase logs for detailed error messages
- Verify your environment variables
- Ensure your Supabase project is active
