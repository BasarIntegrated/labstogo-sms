#!/usr/bin/env node

/**
 * Supabase CLI Setup and Migration Script
 * 
 * This script helps you set up Supabase CLI and run the migration
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function showSupabaseSetup() {
  console.log('🚀 Supabase CLI Setup and Migration');
  console.log('');
  console.log('✅ Supabase CLI is installed locally as ./supabase-cli');
  console.log('');
  console.log('📋 To complete the setup and run the migration:');
  console.log('');
  console.log('1. Login to Supabase CLI:');
  console.log('   ./supabase-cli login');
  console.log('   (This will open your browser for authentication)');
  console.log('');
  console.log('2. Link your project:');
  console.log('   ./supabase-cli link --project-ref whanmvvrhztjrvpxgsok');
  console.log('');
  console.log('3. Run the migration:');
  console.log('   ./supabase-cli db push');
  console.log('');
  console.log('🔧 Alternative: If CLI setup is too complex, you can still:');
  console.log('   - Go to https://supabase.com/dashboard');
  console.log('   - Select your project (whanmvvrhztjrvpxgsok)');
  console.log('   - Click "SQL Editor"');
  console.log('   - Copy and paste the migration SQL');
  console.log('');
  console.log('📄 Migration SQL:');
  console.log('='.repeat(80));
  
  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'migrations', '004_patients_schema', 'up.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(migrationSQL);
  console.log('='.repeat(80));
  console.log('');
  
  console.log('🎯 After running the migration, verify it worked:');
  console.log('   node scripts/verify-migration.js');
  console.log('');
  console.log('🚀 Your application is ready - just needs the database migration!');
}

showSupabaseSetup();
