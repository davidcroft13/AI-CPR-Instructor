#!/bin/bash
cd "$(dirname "$0")"
echo "🧹 Cleaning up old processes..."
pkill -f "expo start" 2>/dev/null
pkill -f "metro" 2>/dev/null
sleep 2
echo "🚀 Starting Expo server..."
npx expo start --web --clear

