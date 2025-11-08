# Quick Start Guide

## ✅ What I've Fixed

1. **Installed web dependencies**: `react-dom` and `react-native-web`
2. **Installed gesture handler**: Required for React Navigation
3. **Added gesture handler import**: In `index.js` (entry point)
4. **Fixed CSS import**: Properly configured for NativeWind

## 🚀 Running the App

### Option 1: Web (Recommended)
```bash
npm run web
```

This will:
- Start the Expo development server
- Open your browser automatically
- Show the app at `http://localhost:8081` (or similar)

### Option 2: Development Server
```bash
npm start
```

Then press `w` to open in web browser.

## 🔍 Troubleshooting

If you see errors:

1. **Clear cache and restart**:
   ```bash
   npx expo start --clear --web
   ```

2. **Check browser console**: Open DevTools (F12) and look for errors

3. **Verify environment variables**: Make sure `.env` is saved with all values

4. **Check Metro bundler**: The terminal should show "Metro waiting on..."

## 📱 What You Should See

- **Home Page**: Hero section with "Start Training" button
- **Navigation**: Clean, modern UI with Tailwind CSS styling
- **Auth Flow**: Sign up/Login pages ready to use

## 🎯 Next Steps

1. Run `npm run web`
2. The app should open in your browser
3. Try signing up to test the Supabase integration
4. Check the Dashboard to see your stats

## ⚠️ Common Issues

**Blank screen?**
- Check browser console for errors
- Verify Supabase URL is correct in `.env`
- Make sure database tables are created

**Styling not working?**
- NativeWind v4 should work with `className`
- If styles don't appear, try clearing cache: `npx expo start --clear`

**Navigation errors?**
- Gesture handler is installed and imported
- React Navigation should work on web

