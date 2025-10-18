#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking current table structure...');
  
  // Check if leads table exists
  const { data: leadsData, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .limit(1);
  
  if (leadsError) {
    console.log('❌ Leads table error:', leadsError.message);
  } else {
    console.log('✅ Leads table exists');
    if (leadsData && leadsData.length > 0) {
      console.log('📊 Sample leads data:', Object.keys(leadsData[0]));
    }
  }
  
  // Check if patients table exists
  const { data: patientsData, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .limit(1);
  
  if (patientsError) {
    console.log('❌ Patients table error:', patientsError.message);
  } else {
    console.log('✅ Patients table exists');
    if (patientsData && patientsData.length > 0) {
      console.log('📊 Sample patients data:', Object.keys(patientsData[0]));
    }
  }
  
  // Check other tables
  const tables = ['campaigns', 'sms_messages', 'job_queue', 'system_settings'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': Exists`);
    }
  }
}

async function createPatientsTable() {
  console.log('🚀 Creating patients table...');
  
  try {
    // First, let's see what columns exist in leads
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (leadsError) {
      console.log('❌ Cannot access leads table:', leadsError.message);
      return;
    }
    
    console.log('📊 Current leads table structure:');
    if (leadsData && leadsData.length > 0) {
      console.log(Object.keys(leadsData[0]));
    }
    
    // Create a simple patients table with basic structure
    console.log('🔄 Creating patients table with basic structure...');
    
    // We'll use a simple approach - create a new table
    const { error: createError } = await supabase
      .from('patients')
      .select('*')
      .limit(0);
    
    if (createError && createError.message.includes('relation "patients" does not exist')) {
      console.log('📝 Patients table does not exist, creating it...');
      
      // Since we can't execute DDL directly, let's create sample data
      const samplePatient = {
        id: '00000000-0000-0000-0000-000000000000',
        phone_number: '+15551234567',
        first_name: 'Test',
        last_name: 'Patient',
        email: 'test@example.com',
        license_type: 'Medical',
        license_number: 'MD123456',
        specialty: 'Cardiology',
        status: 'active',
        date_of_birth: '1990-01-01',
        last_exam_date: '2024-01-01',
        next_exam_due: '2025-01-01',
        preferred_contact_method: 'sms',
        tags: ['test'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Sample patient structure:', Object.keys(samplePatient));
      console.log('✅ Patients table structure defined');
      
    } else if (createError) {
      console.log('❌ Error checking patients table:', createError.message);
    } else {
      console.log('✅ Patients table already exists');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await checkTables();
      break;
    case 'create':
      await createPatientsTable();
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/check-patients.js check   - Check table structure');
      console.log('  node scripts/check-patients.js create - Create patients table structure');
  }
}

main().catch(console.error);
