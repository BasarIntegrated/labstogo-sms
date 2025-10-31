# 🔄 Migration Reference Guide

**Quick Reference for Database Migrations in LabsToGo SMS Project**

---

## 🎯 How to Use This Guide (For AI Assistant)

When requesting database changes that require migrations, simply say one of these:

> **"Please refer to the migration reference guide"**  
> **"See MIGRATION_REFERENCE.md"**  
> **"Follow the migration reference guide"**  
> **"Check MIGRATION_REFERENCE.md for this migration"**

This ensures all migrations follow best practices:

- ✅ Proper file format and location
- ✅ UUID extension checks
- ✅ Idempotent SQL statements
- ✅ Supabase-specific patterns
- ✅ Testing and push commands

**Example**: _"Add a notifications table. Please refer to the migration reference guide."_

---

## 📍 Key Locations

- **Supabase Migrations**: `supabase/migrations/`
- **Legacy Migrations**: `migrations/` (organized by number)
- **Migration Script**: `scripts/apply-settings-migration.sh`

---

## 🗂️ Migration File Naming Convention

Supabase migrations follow this pattern:

```
YYYYMMDDHHMMSS_migration_name.sql
```

Example:

- `20251029000000_add_system_settings.sql`
- `20251028131200_add_email_messages.sql`

**Important**: Always use timestamp format for Supabase migrations to ensure proper ordering.

---

## 🚀 Common Migration Commands

### Apply Migrations to Local Database

```bash
# Reset local database and apply all migrations
supabase db reset

# Apply migrations without resetting
supabase migration up
```

### Push Migrations to Remote (Production)

```bash
# Push all pending migrations to remote database
supabase db push

# With confirmation prompt (default)
supabase db push

# Force push without confirmation
supabase db push --linked
```

### Check Migration Status

```bash
# Check local Supabase status
supabase status

# List remote projects
supabase projects list

# Check which project is linked
cat supabase/.branches/_current_branch
```

### Link to Remote Project

```bash
# Link to a remote Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Get project reference ID
supabase projects list
```

---

## 📝 Creating a New Migration

### Option 1: Manual Creation (Recommended for Supabase)

1. Create file in `supabase/migrations/`:

   ```bash
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_your_migration_name.sql
   ```

2. Follow this template:

   ```sql
   -- Migration: Your migration name
   -- Description: What this migration does
   -- Created: YYYY-MM-DD

   -- Enable required extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Your migration SQL here
   CREATE TABLE IF NOT EXISTS your_table (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     -- ... other columns
   );

   -- Create indexes
   CREATE INDEX IF NOT EXISTS idx_your_table_column ON your_table(column);

   -- Create triggers (if needed)
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   -- Enable RLS (if needed)
   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

   -- Create policies (if needed)
   CREATE POLICY "policy_name" ON your_table FOR ALL USING (true);
   ```

### Option 2: Using Migration Generator

```bash
# Create a new migration using the generator
npm run migration:create your_migration_name
```

**Note**: This creates files in `migrations/` directory. Copy to `supabase/migrations/` with timestamp format.

---

## ✅ Best Practices

### 1. Always Include Extension Checks

```sql
-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 2. Use IF NOT EXISTS for Idempotency

```sql
-- Tables
CREATE TABLE IF NOT EXISTS table_name (...);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column);

-- Functions
CREATE OR REPLACE FUNCTION function_name(...);

-- Triggers
DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name ...
```

### 3. Handle Conflicts Gracefully

```sql
-- For inserts with unique constraints
INSERT INTO table_name (...)
VALUES (...)
ON CONFLICT (unique_column) DO NOTHING;

-- Or update on conflict
INSERT INTO table_name (...)
VALUES (...)
ON CONFLICT (unique_column) DO UPDATE SET column = EXCLUDED.column;
```

### 4. Always Test Locally First

```bash
# Test on local database
supabase db reset

# Verify the migration worked
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\d table_name"
```

### 5. Use Proper Timestamps

Always use UTC timestamps in format: `YYYYMMDDHHMMSS`

Current timestamp command:

```bash
date +%Y%m%d%H%M%S
```

---

## 🔍 Common Migration Patterns

### Creating a Table with Standard Fields

```sql
CREATE TABLE IF NOT EXISTS your_table (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign keys
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Constraints
  UNIQUE(name),
  CHECK (status IN ('active', 'inactive', 'pending'))
);

-- Auto-update updated_at
CREATE TRIGGER update_your_table_updated_at
  BEFORE UPDATE ON your_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_your_table_status ON your_table(status);
CREATE INDEX IF NOT EXISTS idx_your_table_user_id ON your_table(user_id);
```

### Adding Columns to Existing Table

```sql
-- Add new column
ALTER TABLE existing_table
ADD COLUMN IF NOT EXISTS new_column VARCHAR(255);

-- Add column with default
ALTER TABLE existing_table
ADD COLUMN IF NOT EXISTS new_column BOOLEAN DEFAULT false;

-- Add not null column to existing table (requires default)
ALTER TABLE existing_table
ADD COLUMN IF NOT EXISTS new_column VARCHAR(255) NOT NULL DEFAULT '';
```

### Modifying Columns

```sql
-- Change column type
ALTER TABLE table_name
ALTER COLUMN column_name TYPE new_type USING column_name::new_type;

-- Add constraint
ALTER TABLE table_name
ADD CONSTRAINT constraint_name CHECK (condition);

-- Drop constraint
ALTER TABLE table_name
DROP CONSTRAINT IF EXISTS constraint_name;
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policy (allow all for now)
CREATE POLICY "Allow all operations on table_name"
ON table_name FOR ALL USING (true);

-- Or more restrictive policy
CREATE POLICY "Users can only see their own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);
```

---

## 🐛 Troubleshooting

### Migration Fails: Function Not Found

**Error**: `function uuid_generate_v4() does not exist`

**Solution**: Add at the top of migration:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Migration Fails: Table Already Exists

**Error**: `relation "table_name" already exists`

**Solution**: Use `IF NOT EXISTS`:

```sql
CREATE TABLE IF NOT EXISTS table_name (...);
```

### Migration Fails: Policy Already Exists

**Error**: `policy "policy_name" already exists`

**Solution**: Drop before creating:

```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name ...;
```

### Can't Push to Remote

**Error**: `Not linked to remote project`

**Solution**: Link your project first:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Migration Applied But Table Not Found

**Check**:

1. Verify migration file is in `supabase/migrations/`
2. Check timestamp format is correct (YYYYMMDDHHMMSS)
3. Run `supabase db reset` to reapply all migrations
4. Check Supabase Studio: http://127.0.0.1:54323

---

## 📊 Verification Commands

### Check Migration Applied

```bash
# Check table exists
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\d table_name"

# Check table data
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT * FROM table_name LIMIT 5;"

# List all tables
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\dt"
```

### Check Remote Database (via Supabase Dashboard)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Table Editor** to see tables
4. Navigate to **SQL Editor** to run queries

---

## 🔄 Workflow Example

### Typical Migration Workflow

1. **Create migration file**:

   ```bash
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_add_new_feature.sql
   ```

2. **Write migration SQL** (use template above)

3. **Test locally**:

   ```bash
   supabase db reset
   ```

4. **Verify**:

   ```bash
   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\d new_table"
   ```

5. **Push to remote**:

   ```bash
   supabase db push
   ```

6. **Verify in production**:
   - Check Supabase Dashboard
   - Test API endpoints that use the new schema

---

## 📚 Additional Resources

- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **PostgreSQL Migration Best Practices**: https://www.postgresql.org/docs/current/ddl-alter.html
- **Local Supabase**: http://127.0.0.1:54323 (Studio)
- **Local Database**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

---

## 🎯 Quick Command Reference

```bash
# Status check
supabase status

# Reset local (applies all migrations)
supabase db reset

# Push to remote
supabase db push

# Link to remote project
supabase link --project-ref PROJECT_REF

# List remote projects
supabase projects list

# Generate timestamp for migration
date +%Y%m%d%H%M%S

# Connect to local database
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

---

## ⚠️ Important Notes

1. **Always backup production database** before applying migrations
2. **Test migrations locally first** with `supabase db reset`
3. **Use IF NOT EXISTS** for idempotency
4. **Check extension dependencies** (uuid-ossp, pgcrypto, etc.)
5. **Use proper timestamps** for migration ordering
6. **Review SQL before pushing** to production
7. **One migration = one logical change** (keep focused)

---

**Last Updated**: 2025-10-29  
**Project**: LabsToGo SMS Blaster  
**Database**: PostgreSQL (Supabase)
