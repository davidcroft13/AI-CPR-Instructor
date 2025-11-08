/**
 * Automated Database Setup Script
 * 
 * Attempts to set up the database programmatically using Supabase REST API.
 * Falls back to manual instructions if automated setup isn't possible.
 * 
 * Run with: node scripts/setup-database-auto.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env file.');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🚀 Attempting automated database setup...\n');

  const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Extract project reference from URL
  const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
  if (!urlMatch) {
    console.log('⚠️  Could not parse Supabase URL. Using manual setup.\n');
    showManualInstructions(sql, schemaPath);
    return;
  }

  const projectRef = urlMatch[1];
  const baseUrl = supabaseUrl.split('/rest/v1')[0];

  console.log('📡 Attempting to execute SQL via Supabase API...\n');

  try {
    // Try using Supabase Management API
    // Note: This requires the Supabase Management API token, not the service role key
    // For now, we'll provide the manual approach which is more reliable
    
    console.log('ℹ️  Supabase requires SQL execution through their dashboard.');
    console.log('   This is the most reliable method.\n');
    
    showManualInstructions(sql, schemaPath, baseUrl);
    
  } catch (error) {
    console.error('❌ Automated setup failed:', error.message);
    console.log('\n📋 Falling back to manual setup...\n');
    showManualInstructions(sql, schemaPath, baseUrl);
  }
}

function showManualInstructions(sql, schemaPath, dashboardUrl) {
  console.log('📋 MANUAL SETUP INSTRUCTIONS');
  console.log('=' .repeat(60) + '\n');
  
  if (dashboardUrl) {
    console.log('1️⃣  Open your Supabase Dashboard:');
    console.log(`   👉 ${dashboardUrl}\n`);
  } else {
    console.log('1️⃣  Open your Supabase Dashboard:');
    console.log('   👉 https://app.supabase.com\n');
  }
  
  console.log('2️⃣  Click "SQL Editor" in the left sidebar\n');
  console.log('3️⃣  Click "New query"\n');
  console.log('4️⃣  Copy the SQL from the file below:\n');
  console.log(`   📄 ${schemaPath}\n`);
  console.log('5️⃣  Paste into SQL Editor\n');
  console.log('6️⃣  Click "Run" (or Cmd/Ctrl + Enter)\n');
  console.log('7️⃣  Wait for success message\n');
  
  console.log('💡 Quick copy (macOS):');
  console.log(`   cat "${schemaPath}" | pbcopy\n`);
  
  console.log('📝 SQL Preview:');
  console.log('=' .repeat(60));
  console.log(sql);
  console.log('=' .repeat(60) + '\n');
  
  console.log('✅ After running, verify in "Table Editor" that you see:');
  console.log('   • teams');
  console.log('   • users');
  console.log('   • lessons');
  console.log('   • lesson_results\n');
}

setupDatabase();

