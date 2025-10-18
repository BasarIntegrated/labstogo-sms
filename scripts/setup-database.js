#!/usr/bin/env node

/**
 * Database Setup Script for LabsToGo SMS
 * 
 * This script creates the campaigns table and initial data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up LabsToGo SMS Database...');
  console.log('=====================================\n');
  
  try {
    // Step 1: Create campaigns table
    console.log('📋 Creating campaigns table...');
    
    const createTableSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create campaigns table with all required columns
      CREATE TABLE IF NOT EXISTS campaigns (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          message_template TEXT NOT NULL,
          campaign_type VARCHAR(50) DEFAULT 'renewal_reminder' CHECK (campaign_type IN ('renewal_reminder', 'exam_notification', 'general', 'custom')),
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled')),
          scheduled_at TIMESTAMP WITH TIME ZONE,
          filters JSONB DEFAULT '{}',
          renewal_deadline_start DATE,
          renewal_deadline_end DATE,
          license_types TEXT[] DEFAULT '{}',
          specialties TEXT[] DEFAULT '{}',
          reminder_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly')),
          max_reminders INTEGER DEFAULT 3,
          total_patients INTEGER DEFAULT 0,
          sent_count INTEGER DEFAULT 0,
          delivered_count INTEGER DEFAULT 0,
          failed_count INTEGER DEFAULT 0,
          -- Comprehensive timestamp coverage
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          deleted_at TIMESTAMP WITH TIME ZONE,
          created_by UUID,
          updated_by UUID,
          deleted_by UUID
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
      CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_type ON campaigns(campaign_type);
      CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

      -- Create function to update updated_at column
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger to automatically update updated_at
      CREATE TRIGGER update_campaigns_updated_at 
          BEFORE UPDATE ON campaigns 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      console.error('❌ Error creating table:', tableError.message);
      console.log('\n🔧 Manual Setup Required:');
      console.log('1. Go to your Supabase Dashboard → SQL Editor');
      console.log('2. Copy and paste the SQL from scripts/setup-campaigns-table.sql');
      console.log('3. Run the SQL script');
      return;
    }

    console.log('✅ Campaigns table created successfully!');

    // Step 2: Insert initial campaigns
    console.log('\n📝 Creating initial campaigns...');
    
    const { data: campaign1, error: error1 } = await supabase
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

    if (error1) {
      console.error('❌ Error creating first campaign:', error1.message);
    } else {
      console.log('✅ Created: Medical License Renewal');
    }

    const { data: campaign2, error: error2 } = await supabase
      .from('campaigns')
      .insert({
        name: 'Urgent License Renewal',
        description: 'Urgent reminder for licenses expiring soon',
        message_template: 'URGENT: {{first_name}}, your {{license_type}} license ({{license_number}}) expires in {{days_until_renewal}} days on {{renewal_deadline}}. Renew immediately! Reply STOP to opt out.',
        campaign_type: 'renewal_reminder',
        status: 'draft',
        license_types: ['Medical', 'Nursing', 'Pharmacy', 'Dental'],
        specialties: [],
        reminder_frequency: 'daily',
        max_reminders: 3,
        total_patients: 0,
        sent_count: 0,
        delivered_count: 0,
        failed_count: 0,
        created_by: '00000000-0000-0000-0000-000000000000',
      })
      .select()
      .single();

    if (error2) {
      console.error('❌ Error creating second campaign:', error2.message);
    } else {
      console.log('✅ Created: Urgent License Renewal');
    }

    // Step 3: Verify setup
    console.log('\n🔍 Verifying setup...');
    const { data: campaigns, error: verifyError } = await supabase
      .from('campaigns')
      .select('id, name, status, campaign_type')
      .order('created_at');

    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError.message);
    } else {
      console.log('✅ Database setup complete!');
      console.log(`📊 Found ${campaigns.length} campaigns:`);
      campaigns.forEach(campaign => {
        console.log(`   - ${campaign.name} (${campaign.status})`);
      });
      console.log('\n🎉 Your campaign management system is ready!');
      console.log('Visit http://localhost:3000/campaigns to get started.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n🔧 Manual Setup Required:');
    console.log('1. Go to your Supabase Dashboard → SQL Editor');
    console.log('2. Copy and paste the SQL from scripts/setup-campaigns-table.sql');
    console.log('3. Run the SQL script');
  }
}

setupDatabase();
