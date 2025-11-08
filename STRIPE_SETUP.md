# Stripe Payment Integration Setup

This guide will help you set up Stripe payments for the CPR AI Trainer app.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Your Stripe API keys (available in Stripe Dashboard → Developers → API keys)

## Environment Variables

Add these to your `.env` file:

```env
# Stripe Keys
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...  # Server-side only, never expose to client
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe Dashboard → Webhooks

# Base URL for redirects (update for production)
BASE_URL=http://localhost:19006  # Change to your production URL
```

## Database Setup

Run the payment schema SQL in your Supabase SQL Editor:

```bash
# Copy and run the contents of database-schema-payments.sql
```

This creates:
- `payments` table for tracking payments
- `payment_status` column on `users` table
- RLS policies for secure access

## Backend API Setup

The app requires backend API endpoints to securely create Stripe checkout sessions. You have several deployment options:

### Option 1: Supabase Edge Functions (Recommended)

1. Install Supabase CLI: `npm install -g supabase`
2. Initialize: `supabase init`
3. Create function: `supabase functions new create-checkout-session`
4. Copy the code from `api/create-checkout-session.js` to your function
5. Deploy: `supabase functions deploy create-checkout-session`
6. Set environment variables in Supabase Dashboard

### Option 2: Vercel Serverless Functions

1. Create `api/create-checkout-session.js` in your Vercel project
2. Install dependencies: `npm install stripe
3. Deploy to Vercel
4. Set environment variables in Vercel Dashboard

### Option 3: Netlify Functions

1. Create `netlify/functions/create-checkout-session.js`
2. Install dependencies
3. Deploy to Netlify
4. Set environment variables in Netlify Dashboard

### Option 4: Express.js Server

Create a simple Express server with the API endpoints and deploy to any hosting service.

## Webhook Setup

1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy the webhook signing secret to your `.env` file

## Payment Flow

### Individual Signup
1. User fills out signup form
2. User is redirected to Stripe Checkout
3. After payment, account is created
4. User is redirected to dashboard

### Team Member Signup
1. Team owner invites member (via email/invite code)
2. Invited member signs up with invite code
3. Payment required during signup
4. After payment, member is added to team

## Testing

Use Stripe test mode:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code

## Production Checklist

- [ ] Switch to Stripe live keys
- [ ] Update `BASE_URL` to production URL
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Test payment flow end-to-end
- [ ] Set up payment failure handling
- [ ] Configure email notifications in Stripe
- [ ] Set up payment analytics

## Troubleshooting

### Payment not completing
- Check webhook is receiving events
- Verify webhook secret is correct
- Check database for payment records
- Review Stripe Dashboard logs

### Checkout session creation fails
- Verify Stripe secret key is correct
- Check API endpoint is deployed and accessible
- Review server logs for errors

### User not activated after payment
- Check webhook is processing events
- Verify payment record is created in database
- Check user payment_status is updated

