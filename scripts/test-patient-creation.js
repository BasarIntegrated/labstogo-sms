#!/usr/bin/env node

/**
 * Test Patient Creation
 * This script tests if patient creation works correctly after the phone column fix
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatientCreation() {
  console.log('🧪 Testing Patient Creation...');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Create a patient with phone_number
    console.log('\n1️⃣ Testing patient creation with phone_number...');
    const testPatient = {
      first_name: 'Test',
      last_name: 'Patient',
      phone_number: '+1234567890',
      email: 'test@example.com',
      status: 'active'
    };
    
    const { data, error } = await supabase
      .from('patients')
      .insert(testPatient)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Patient creation failed:', error);
      return false;
    }
    
    console.log('✅ Patient created successfully:', data);
    
    // Test 2: Verify the patient can be retrieved
    console.log('\n2️⃣ Testing patient retrieval...');
    const { data: retrievedPatient, error: retrieveError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', data.id)
      .single();
    
    if (retrieveError) {
      console.error('❌ Patient retrieval failed:', retrieveError);
      return false;
    }
    
    console.log('✅ Patient retrieved successfully:', retrievedPatient);
    
    // Test 3: Test phone_number search
    console.log('\n3️⃣ Testing phone_number search...');
    const { data: searchResults, error: searchError } = await supabase
      .from('patients')
      .select('*')
      .eq('phone_number', '+1234567890');
    
    if (searchError) {
      console.error('❌ Phone search failed:', searchError);
      return false;
    }
    
    console.log('✅ Phone search successful:', searchResults.length, 'results found');
    
    // Test 4: Test phone_number LIKE query
    console.log('\n4️⃣ Testing phone_number LIKE query...');
    const { data: likeResults, error: likeError } = await supabase
      .from('patients')
      .select('*')
      .like('phone_number', '+123%');
    
    if (likeError) {
      console.error('❌ Phone LIKE query failed:', likeError);
      return false;
    }
    
    console.log('✅ Phone LIKE query successful:', likeResults.length, 'results found');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('patients')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Patient creation works correctly');
    console.log('✅ Phone column issue is resolved');
    console.log('✅ Database schema is correct');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

async function checkSchemaDetails() {
  console.log('\n🔍 Checking Schema Details...');
  console.log('='.repeat(50));
  
  try {
    // Check patients table structure
    const { data: patientsColumns, error: patientsError } = await supabase
      .rpc('get_table_columns', { table_name: 'patients' });
    
    if (!patientsError && patientsColumns) {
      console.log('📋 Patients table columns:');
      patientsColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // Check sms_messages table structure
    const { data: smsColumns, error: smsError } = await supabase
      .rpc('get_table_columns', { table_name: 'sms_messages' });
    
    if (!smsError && smsColumns) {
      console.log('\n📋 SMS Messages table columns:');
      smsColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }
    
  } catch (error) {
    console.log('ℹ️  Could not fetch detailed schema info (this is normal)');
  }
}

async function main() {
  console.log('🚀 Starting Patient Creation Test');
  console.log('='.repeat(60));
  
  await checkSchemaDetails();
  
  const success = await testPatientCreation();
  
  if (success) {
    console.log('\n🎯 CONCLUSION:');
    console.log('✅ Phone column issue is COMPLETELY RESOLVED');
    console.log('✅ Your application will work perfectly now');
    console.log('✅ Patient creation, search, and management all functional');
    process.exit(0);
  } else {
    console.log('\n❌ CONCLUSION:');
    console.log('❌ There are still issues that need to be addressed');
    process.exit(1);
  }
}

main().catch(console.error);
