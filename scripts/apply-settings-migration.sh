#!/bin/bash

# Script to apply system_settings migration to Supabase
# This script can be run locally or remotely depending on your Supabase setup

echo "🚀 Applying system_settings migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo ""
    echo "Alternatively, you can apply the migration manually in Supabase Dashboard:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to SQL Editor"
    echo "4. Copy and paste the contents of: supabase/migrations/20251029000000_add_system_settings.sql"
    echo "5. Click 'Run'"
    exit 1
fi

# Check if we're linked to a project
if supabase status &> /dev/null; then
    echo "📦 Pushing migration to linked Supabase project..."
    supabase db push
    echo "✅ Migration applied successfully!"
else
    echo "⚠️  Not linked to a local Supabase project."
    echo ""
    echo "To link to your remote project, run:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Then run this script again, or:"
    echo "   supabase db push"
    echo ""
    echo "Alternatively, apply the migration manually:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to SQL Editor"
    echo "4. Copy and paste the contents of: supabase/migrations/20251029000000_add_system_settings.sql"
    echo "5. Click 'Run'"
fi

