#!/usr/bin/env node

/**
 * Database Scanner Script
 * Scans Supabase database structure and data
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function scanDatabase() {
  console.log('🔍 Scanning Supabase Database...\n');
  console.log('📍 Database URL:', supabaseUrl.replace(/\/\/.*@/, '//***@'));
  console.log('═══════════════════════════════════════════════════════════\n');

  // List of tables based on migrations
  const tableNames = [
    'users',
    'sessions',
    'contact_groups',
    'contacts',
    'campaigns',
    'campaign_recipients',
    'sms_messages',
    'email_messages',
    'message_templates',
    'settings',
    'uploads',
  ];

  for (const tableName of tableNames) {
    try {
      // Check if table exists by trying to query it
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError && countError.code === 'PGRST204') {
        console.log(`\n⚠️  Table: ${tableName} - Does not exist`);
        continue;
      }

      // Get row count
      const rowCount = count || 0;

      // Get sample data (first 2 rows)
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(2);

      if (sampleError && sampleError.code !== 'PGRST204' && sampleError.code !== '42P01') {
        console.log(`\n⚠️  Table: ${tableName} - Error: ${sampleError.message}`);
        continue;
      }

      console.log(`\n📊 Table: ${tableName}`);
      console.log('─'.repeat(70));
      console.log(`   Row Count: ${rowCount}`);

      if (sampleData && sampleData.length > 0) {
        // Infer structure from sample data
        const columns = Object.keys(sampleData[0]);
        console.log('\n   Columns:', columns.join(', '));
        
        console.log('\n   Sample Data:');
        sampleData.forEach((row, idx) => {
          const preview = JSON.stringify(row, null, 2);
          const truncated = preview.length > 400 ? preview.substring(0, 400) + '...' : preview;
          console.log(`     [${idx + 1}] ${truncated.replace(/\n/g, '\n        ')}`);
        });
      } else if (rowCount === 0) {
        console.log('   ⚪ No data in table');
        // Try to get column names by doing a select with limit 0
        try {
          const { data: emptyData } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);
          if (emptyData !== null) {
            // Table exists but is empty
            console.log('   ✓ Table structure exists (empty table)');
          }
        } catch (e) {
          // Ignore errors
        }
      }

    } catch (err) {
      console.log(`\n⚠️  Table: ${tableName} - ${err.message}`);
    }
  }

  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('✅ Database scan complete!');
}

// Run the scan
scanDatabase().catch(console.error);
