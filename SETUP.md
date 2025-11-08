# Database Setup Guide

## Quick Setup

1. **Run the setup script** (displays SQL and instructions):
   ```bash
   node scripts/setup-database.js
   ```

2. **Or manually copy the SQL**:
   - Open `database-schema.sql` in your editor
   - Copy all contents
   - Go to Supabase Dashboard → SQL Editor
   - Paste and run

## Manual Steps

### Step 1: Open Supabase Dashboard
Go to: https://app.supabase.com and select your project

### Step 2: Open SQL Editor
Click "SQL Editor" in the left sidebar, then click "New query"

### Step 3: Copy SQL
Copy the entire contents of `database-schema.sql`

### Step 4: Execute
1. Paste the SQL into the editor
2. Click "Run" (or press Cmd/Ctrl + Enter)
3. Wait for success message

### Step 5: Verify
Check "Table Editor" - you should see:
- ✅ `teams` table
- ✅ `users` table  
- ✅ `lessons` table (with 4 sample lessons)
- ✅ `lesson_results` table

## What Gets Created

- **Tables**: 4 tables with proper relationships
- **Row Level Security**: Enabled on all tables
- **Policies**: Secure access policies for users and teams
- **Sample Data**: 4 CPR training lessons

## Troubleshooting

If you get errors:
- Make sure you're using the correct Supabase project
- Check that all SQL statements are copied completely
- Verify you have admin access to the project

## Next Steps

After setup:
1. Your database is ready!
2. Test by creating a user account in the app
3. The app will automatically create a team for new users

