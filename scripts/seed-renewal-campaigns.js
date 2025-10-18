#!/usr/bin/env node

/**
 * Seed Initial Renewal Campaigns
 * Creates default renewal campaigns for the Message Blasting App
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

const renewalCampaigns = [
  {
    name: "30-Day License Renewal Reminder",
    description: "Automated reminder sent 30 days before license expiration",
    message_template: "Hi {first_name}, your {license_type} license expires in {days_until_expiry} days on {license_expiration_date}. Please renew to avoid any interruption in service. Contact us at {phone} if you need assistance.",
    campaign_type: "renewal_reminder",
    status: "draft",
    recipient_type: "all",
    created_by: "00000000-0000-0000-0000-000000000000", // Will be replaced with actual admin user ID
  },
  {
    name: "7-Day Urgent Renewal Reminder",
    description: "Urgent reminder sent 7 days before license expiration",
    message_template: "URGENT: {first_name}, your {license_type} license expires in {days_until_expiry} days! Renew now to avoid service interruption. Visit [renewal-link] or call {phone} immediately.",
    campaign_type: "renewal_reminder",
    status: "draft",
    recipient_type: "all",
    created_by: "00000000-0000-0000-0000-000000000000",
  },
  {
    name: "Exam Notification Campaign",
    description: "Notification for upcoming professional exams",
    message_template: "Hello {first_name}, your {specialty} exam is scheduled. Please prepare accordingly and ensure all requirements are met. Good luck! Contact us at {phone} for any questions.",
    campaign_type: "exam_notification",
    status: "draft",
    recipient_type: "all",
    created_by: "00000000-0000-0000-0000-000000000000",
  },
  {
    name: "License Expiration Notice",
    description: "Final notice for expired licenses",
    message_template: "NOTICE: {first_name}, your {license_type} license has expired. Please renew immediately to restore your professional status. Call {phone} for urgent assistance.",
    campaign_type: "renewal_reminder",
    status: "draft",
    recipient_type: "all",
    created_by: "00000000-0000-0000-0000-000000000000",
  },
];

async function seedRenewalCampaigns() {
  try {
    console.log('🌱 Seeding renewal campaigns...\n');

    // First, get or create admin user
    let adminUser;
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@messageblasting.com')
      .single();

    if (existingAdmin) {
      adminUser = existingAdmin;
      console.log('✅ Found existing admin user');
    } else {
      // Create admin user if doesn't exist
      const { data: newAdmin, error: adminError } = await supabase
        .from('users')
        .insert({
          email: 'admin@messageblasting.com',
          password_hash: 'admin123', // In production, this should be properly hashed
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
        })
        .select('id')
        .single();

      if (adminError) {
        console.error('❌ Error creating admin user:', adminError);
        return;
      }

      adminUser = newAdmin;
      console.log('✅ Created admin user');
    }

    // Create default contact group if it doesn't exist
    let defaultGroup;
    const { data: existingGroup } = await supabase
      .from('contact_groups')
      .select('id')
      .eq('name', 'License Holders')
      .single();

    if (existingGroup) {
      defaultGroup = existingGroup;
      console.log('✅ Found existing contact group');
    } else {
      const { data: newGroup, error: groupError } = await supabase
        .from('contact_groups')
        .insert({
          name: 'License Holders',
          description: 'Default group for all license holders',
          color: '#3B82F6',
          created_by: adminUser.id,
        })
        .select('id')
        .single();

      if (groupError) {
        console.error('❌ Error creating contact group:', groupError);
        return;
      }

      defaultGroup = newGroup;
      console.log('✅ Created contact group');
    }

    // Create renewal campaigns
    const campaignsToCreate = renewalCampaigns.map(campaign => ({
      ...campaign,
      created_by: adminUser.id,
    }));

    const { data: createdCampaigns, error: campaignError } = await supabase
      .from('campaigns')
      .insert(campaignsToCreate)
      .select('id, name');

    if (campaignError) {
      console.error('❌ Error creating campaigns:', campaignError);
      return;
    }

    console.log('✅ Created renewal campaigns:');
    createdCampaigns.forEach(campaign => {
      console.log(`   - ${campaign.name} (ID: ${campaign.id})`);
    });

    // Create default message templates
    const defaultTemplates = [
      {
        name: "30-Day Renewal Template",
        description: "Standard template for 30-day renewal reminders",
        content: "Hi {first_name}, your {license_type} license expires in {days_until_expiry} days on {license_expiration_date}. Please renew to avoid any interruption in service.",
        type: "sms",
        character_count: 0,
        parts_estimate: 0,
        merge_tags: ["{first_name}", "{license_type}", "{days_until_expiry}", "{license_expiration_date}"],
        is_active: true,
        created_by: adminUser.id,
      },
      {
        name: "7-Day Urgent Template",
        description: "Urgent template for 7-day renewal reminders",
        content: "URGENT: {first_name}, your {license_type} license expires in {days_until_expiry} days! Renew now to avoid service interruption.",
        type: "sms",
        character_count: 0,
        parts_estimate: 0,
        merge_tags: ["{first_name}", "{license_type}", "{days_until_expiry}"],
        is_active: true,
        created_by: adminUser.id,
      },
      {
        name: "Exam Notification Template",
        description: "Template for exam notifications",
        content: "Hello {first_name}, your {specialty} exam is scheduled. Please prepare accordingly. Good luck!",
        type: "sms",
        character_count: 0,
        parts_estimate: 0,
        merge_tags: ["{first_name}", "{specialty}"],
        is_active: true,
        created_by: adminUser.id,
      },
    ];

    const { data: createdTemplates, error: templateError } = await supabase
      .from('message_templates')
      .insert(defaultTemplates)
      .select('id, name');

    if (templateError) {
      console.error('❌ Error creating templates:', templateError);
      return;
    }

    console.log('✅ Created message templates:');
    createdTemplates.forEach(template => {
      console.log(`   - ${template.name} (ID: ${template.id})`);
    });

    console.log('\n🎉 Renewal campaigns seeded successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Apply the database migration if not done already');
    console.log('   2. Configure Twilio credentials in environment variables');
    console.log('   3. Upload contacts with license information');
    console.log('   4. Start using the renewal campaigns');

  } catch (error) {
    console.error('❌ Error seeding renewal campaigns:', error);
    process.exit(1);
  }
}

seedRenewalCampaigns();
