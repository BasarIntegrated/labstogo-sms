#!/usr/bin/env node

/**
 * Create Initial Campaign Script
 * 
 * This script creates the initial Medical License Renewal campaign
 * Run this after setting up your database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createInitialCampaign() {
  console.log('🚀 Creating initial Medical License Renewal campaign...');
  
  try {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name: 'Medical License Renewal',
        description: 'Standard reminder for medical license renewals',
        message_template: 'Hi {{first_name}}, your medical license ({{license_number}}) expires on {{renewal_deadline}}. Please renew to avoid any interruption in practice. Reply STOP to opt out.',
        campaign_type: 'renewal_reminder',
        status: 'draft',
        license_types: ['Medical'],
        specialties: [],
        reminder_frequency: 'weekly',
        max_reminders: 5,
        total_patients: 0,
        sent_count: 0,
        delivered_count: 0,
        failed_count: 0,
        created_by: '00000000-0000-0000-0000-000000000000',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating campaign:', error.message);
      console.error('Full error:', error);
      return;
    }

    console.log('✅ Initial campaign created successfully!');
    console.log('📋 Campaign Details:');
    console.log(`   Name: ${campaign.name}`);
    console.log(`   ID: ${campaign.id}`);
    console.log(`   Status: ${campaign.status}`);
    console.log(`   Template: ${campaign.message_template}`);
    console.log('');
    console.log('🎉 You can now view this campaign in your application!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Test database connection first
async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('');
      console.error('🔧 Troubleshooting:');
      console.error('1. Check your Supabase URL and API key in .env.local');
      console.error('2. Ensure the campaigns table exists in your database');
      console.error('3. Run the database migrations if needed');
      return false;
    }

    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function main() {
  console.log('📱 LabsToGo SMS - Initial Campaign Setup');
  console.log('=====================================\n');
  
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  console.log('');
  await createInitialCampaign();
}

main();
