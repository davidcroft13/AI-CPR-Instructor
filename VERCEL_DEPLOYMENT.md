# Vercel Deployment Guide

This guide will help you deploy your CPR AI Simulator app to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your GitHub repository connected to Vercel
3. All environment variables ready (from your `.env` file)

## Step 1: Install Vercel CLI (Optional)

You can deploy via the Vercel Dashboard or CLI. For CLI:

```bash
npm install -g vercel
```

## Step 2: Prepare Your Project

The project is already configured with:
- `vercel.json` - Vercel configuration file
- API endpoints in the `api/` folder (will be deployed as serverless functions)
- Build scripts in `package.json`

## Step 3: Deploy via Vercel Dashboard (Recommended)

### 3.1 Import Your Repository

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `davidcroft13/AI-CPR-Instructor`
4. Vercel will automatically detect it's an Expo project

### 3.2 Configure Project Settings

**Framework Preset:** Leave as "Other" or "Expo" (Vercel should auto-detect)

**Root Directory:** Leave as `./` (root)

**Build Command:** 
```
npx expo export:web
```

**Output Directory:** 
```
web-build
```

**Install Command:**
```
npm install
```

### 3.3 Set Environment Variables

In the Vercel project settings, add all your environment variables:

**Important:** Variables prefixed with `EXPO_PUBLIC_` are accessible in client-side code. Server-side variables (for API routes) should NOT have this prefix.

#### Supabase Variables:
```
# Client-side (accessible in React components)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side only (for API routes)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Note:** `SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_URL` should have the same value, but both are needed (one for client, one for server).

#### 11Labs Variables:
```
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
EXPO_PUBLIC_GUIDED_TONE_VOICE_ID=your_guided_voice_id
EXPO_PUBLIC_INTENSE_TONE_VOICE_ID=your_intense_voice_id
```

#### Stripe Variables:
```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

#### Base URL (Important!):
```
BASE_URL=https://your-vercel-app.vercel.app
```

**Note:** After your first deployment, Vercel will give you a URL. Update `BASE_URL` with your actual Vercel URL and redeploy.

### 3.4 Deploy

Click **"Deploy"** and wait for the build to complete.

## Step 4: Configure Stripe Webhook

After deployment, you need to update your Stripe webhook URL:

1. Go to your Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint or edit existing webhook
3. Enter your webhook URL: `https://your-vercel-app.vercel.app/api/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook Signing Secret** and add it to Vercel as `STRIPE_WEBHOOK_SECRET`
6. Redeploy your app

## Step 5: Update Supabase Redirect URLs

1. Go to your Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   - `https://your-vercel-app.vercel.app`
   - `https://your-vercel-app.vercel.app/**`
3. Add to **Site URL**: `https://your-vercel-app.vercel.app`

## Step 6: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Test the following:
   - Landing page loads
   - Sign up flow
   - Login flow
   - Dashboard loads
   - Lessons page loads
   - Payment flow (test mode with Stripe test cards)

## Deploying via CLI (Alternative)

If you prefer using the CLI:

```bash
# Login to Vercel
vercel login

# Deploy (first time - will ask questions)
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add EXPO_PUBLIC_SUPABASE_URL
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
# ... repeat for all variables
```

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (Vercel uses Node 18+ by default)
- Check build logs in Vercel Dashboard

### API Routes Not Working

- Ensure API files are in the `api/` folder
- Check that `vercel.json` has proper rewrites
- Verify environment variables are set correctly

### Environment Variables Not Loading

- Variables must be prefixed with `EXPO_PUBLIC_` to be accessible in client code
- Server-side variables (like `STRIPE_SECRET_KEY`) should NOT have `EXPO_PUBLIC_` prefix
- Redeploy after adding new environment variables

### CORS Issues

- The `vercel.json` includes CORS headers for API routes
- If issues persist, check browser console for specific errors

### Payment Redirects Not Working

- Ensure `BASE_URL` is set to your actual Vercel URL
- Check that payment success/cancel routes are properly configured
- Verify Stripe webhook URL is correct

## Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `BASE_URL` environment variable with your custom domain
6. Update Supabase redirect URLs with your custom domain

## Continuous Deployment

Vercel automatically deploys when you push to your GitHub repository:
- Pushes to `main` branch → Production deployment
- Pull requests → Preview deployments

## Next Steps

After successful deployment:
1. Test all functionality thoroughly
2. Set up monitoring (Vercel Analytics)
3. Configure custom domain if needed
4. Set up staging environment for testing
5. Review and optimize performance

## Support

- Vercel Docs: https://vercel.com/docs
- Expo Web Deployment: https://docs.expo.dev/workflow/web/
- Check build logs in Vercel Dashboard for specific errors

