# CPR Conversational AI Trainer

A web app that teaches CPR through voice-driven AI scenarios using 11Labs technology.

## Features

- **Voice-Driven Training**: Interactive CPR scenarios powered by 11Labs AI voices
- **Two Voice Tones**: Choose between Guided or Intense training modes
- **Team Collaboration**: Create teams and track performance together
- **Progress Tracking**: View statistics, scores, and lesson completion
- **Modern UI**: Clean, responsive design inspired by TrySARA and MedCases

## Tech Stack

- **Frontend**: Expo React (web-first, mobile-ready)
- **Backend**: Supabase (Auth + Database + Storage)
- **AI**: 11Labs API (two voices)
- **Payments**: Stripe (placeholder for future version)
- **Styling**: Tailwind CSS + Framer Motion animations
- **Icons**: lucide-react
- **State Management**: React Context

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file** in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
   SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>
   EXPO_PUBLIC_ELEVENLABS_API_KEY=<YOUR_ELEVENLABS_API_KEY>
   EXPO_PUBLIC_GUIDED_TONE_VOICE_ID=<YOUR_GUIDED_TONE_VOICE_ID>
   EXPO_PUBLIC_INTENSE_TONE_VOICE_ID=<YOUR_INTENSE_TONE_VOICE_ID>
   ```

   Note: All environment variables that need to be accessible in the client must be prefixed with `EXPO_PUBLIC_`.

3. **Set up Supabase Database**:
   
   **Option A: Use the setup script** (recommended):
   ```bash
   node scripts/setup-database.js
   ```
   This will display the SQL and step-by-step instructions.
   
   **Option B: Manual setup**:
   1. Open your Supabase dashboard: https://app.supabase.com
   2. Go to SQL Editor → New query
   3. Copy the contents of `database-schema.sql`
   4. Paste and click "Run"
   5. Verify tables are created in "Table Editor"
   
   See `database-schema.sql` for the complete schema with RLS policies and sample data.

4. **Run the app**:
   ```bash
   npm run web
   ```

## Project Structure

```
├── api/              # API endpoints and webhook handlers
├── components/       # Reusable React components
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and clients
├── pages/            # Screen components
├── App.js            # Main app entry point
└── global.css        # Tailwind CSS imports
```

## Database Schema

- **users**: User profiles with team association
- **teams**: Team information and invite codes
- **lessons**: Available CPR training lessons
- **lesson_results**: User performance and summaries

## API Integration

### 11Labs Integration

The app uses 11Labs Conversation API for voice-driven scenarios:
- `startScenario()`: Initiates a new conversation
- `sendMessage()`: Sends user responses during the scenario
- Webhook endpoint: Receives lesson completion summaries

### Webhook Setup

Deploy the `api/lesson-summary.js` endpoint as a serverless function and configure it as a webhook in your 11Labs dashboard.

## Future Enhancements

- Stripe payment integration for team billing
- Voice input for user responses
- Advanced analytics and reporting
- Mobile app optimization
- Real-time team collaboration features

## License

Private - All rights reserved

