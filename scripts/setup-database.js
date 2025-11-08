/**
 * Database Setup Script
 * 
 * This script provides instructions and SQL to set up your Supabase database.
 * Run with: node scripts/setup-database.js
 */

const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 CPR AI Trainer - Database Setup Helper\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Error: database-schema.sql not found at ${schemaPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 STEP-BY-STEP SETUP INSTRUCTIONS');
    console.log('=' .repeat(60) + '\n');
    
    console.log('1️⃣  Open your Supabase Dashboard');
    console.log('   Go to: https://app.supabase.com\n');
    
    console.log('2️⃣  Select your project (or create a new one)\n');
    
    console.log('3️⃣  Click on "SQL Editor" in the left sidebar\n');
    
    console.log('4️⃣  Click "New query" button\n');
    
    console.log('5️⃣  Copy the SQL below (between the === lines)');
    console.log('   Or copy from: database-schema.sql\n');
    
    console.log('6️⃣  Paste it into the SQL Editor\n');
    
    console.log('7️⃣  Click "Run" button (or press Cmd/Ctrl + Enter)\n');
    
    console.log('8️⃣  Wait for "Success. No rows returned" message\n');
    
    console.log('9️⃣  Verify by checking "Table Editor" - you should see:');
    console.log('    • teams');
    console.log('    • users');
    console.log('    • lessons (with 4 sample lessons)');
    console.log('    • lesson_results\n');
    
    console.log('=' .repeat(60));
    console.log('📝 SQL TO COPY (starts below):');
    console.log('=' .repeat(60) + '\n');
    
    console.log(sql);
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ End of SQL');
    console.log('=' .repeat(60) + '\n');
    
    console.log('💡 TIP: On macOS, you can copy the SQL file directly:');
    console.log(`   cat "${schemaPath}" | pbcopy\n`);
    
    console.log('📄 SQL File Location:');
    console.log(`   ${schemaPath}\n`);
    
    console.log('🎉 After setup, your database will be ready to use!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
