# Troubleshooting Blank Screen

## Quick Checks

1. **Open Browser Console** (F12 or Cmd+Option+I)
   - Look for red error messages
   - Check the Console tab for any errors

2. **Check Network Tab**
   - Look for failed requests
   - Verify Supabase URL is loading

3. **Verify Environment Variables**
   ```bash
   node -e "require('dotenv').config(); console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');"
   ```

## Common Issues

### Issue 1: Supabase Not Initialized
**Symptom**: Blank screen, no errors
**Fix**: Check `.env` file has valid Supabase credentials

### Issue 2: React Navigation Error
**Symptom**: Error in console about NavigationContainer
**Fix**: Already installed `react-native-gesture-handler`

### Issue 3: CSS Not Loading
**Symptom**: App renders but no styles
**Fix**: NativeWind v4 should handle this automatically

### Issue 4: Auth Loading Forever
**Symptom**: Shows "Loading..." indefinitely
**Fix**: Check Supabase connection, might be network/CORS issue

## Debug Steps

1. **Check what's rendering:**
   - You should see "Loading..." briefly, then the Home page
   - If stuck on "Loading...", Supabase might be failing

2. **Test Supabase connection:**
   - Open browser console
   - Look for Supabase warnings or errors

3. **Clear cache and restart:**
   ```bash
   npx expo start --clear --web
   ```

4. **Check if it's a specific page:**
   - Try navigating directly to `/login` or `/signup`
   - See if those pages render

## What Should Happen

1. App starts → Shows "Loading..." (briefly)
2. Checks Supabase auth → No user found
3. Shows Home page (AuthStack) with "Start Training" button
4. User can navigate to Login/SignUp

## If Still Blank

Run this test command to see what's rendering:
```bash
# The app should show at least the loading screen
# If completely blank, check browser console for JavaScript errors
```

