#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Connection test failed:', error.message);
      console.log('This might be expected if the leads table doesn\'t exist yet.');
    } else {
      console.log('✅ Supabase connection successful!');
    }
    
    // Check if tables exist
    console.log('\n📊 Checking existing tables...');
    
    const tables = ['leads', 'patients', 'campaigns', 'sms_messages', 'job_queue', 'system_settings'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}': Not found`);
      } else {
        console.log(`✅ Table '${table}': Exists`);
      }
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
}

testConnection();
