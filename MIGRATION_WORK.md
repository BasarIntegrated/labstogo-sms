# 🗄️ Migration Work Indicator

## Quick Reference for AI Assistant

When requesting database changes that require migrations, use one of these phrases:

### ✅ Recommended Phrases

1. **"Please refer to the migration reference guide"**
2. **"See MIGRATION_REFERENCE.md"**
3. **"Follow the migration reference guide"**
4. **"Check MIGRATION_REFERENCE.md for this migration"**

### 📍 Full Path Reference

If you want to be explicit, you can reference:

- `docs/setup/MIGRATION_REFERENCE.md`

### 🎯 What This Ensures

When you use any of these phrases, the AI will:

- ✅ Create migration files in `supabase/migrations/` with proper timestamp format
- ✅ Include UUID extension checks (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
- ✅ Use idempotent SQL (`IF NOT EXISTS`, `CREATE OR REPLACE`, etc.)
- ✅ Follow Supabase migration best practices
- ✅ Provide testing commands (`supabase db reset`, `supabase db push`)
- ✅ Include proper error handling and rollback considerations

### 📝 Example Usage

```
User: "I need to add a notifications table. Please refer to the migration reference guide."

AI: [Creates migration following all best practices from MIGRATION_REFERENCE.md]
```

---

**File Location**: `docs/setup/MIGRATION_REFERENCE.md`
