# Starting the Development Server

## Quick Start

Run this command in your terminal:

```bash
npm run web
```

Or:

```bash
npx expo start --web
```

## What Happens

1. **Metro bundler starts** - This compiles your React Native code
2. **Server starts** - Usually on `http://localhost:8081`
3. **Browser opens automatically** - The app should open in your default browser

## If Browser Doesn't Open

1. Wait for the server to finish starting (you'll see "Metro waiting on...")
2. Look for a message like: "Web is waiting on http://localhost:8081"
3. Manually open that URL in your browser

## Common Issues

### Port Already in Use
If you see "port 8081 is already in use":
```bash
# Kill the process using port 8081
lsof -ti:8081 | xargs kill -9

# Then start again
npm run web
```

### Server Won't Start
Try clearing the cache:
```bash
npx expo start --web --clear
```

### Still Having Issues
1. Close all terminal windows
2. Navigate to project folder
3. Run `npm run web`
4. Wait for "Metro waiting on..." message
5. Open browser to the URL shown

## Expected Output

You should see something like:
```
› Metro waiting on exp://192.168.x.x:8081
› Web is waiting on http://localhost:8081
```

Then your browser should automatically open to `http://localhost:8081`

