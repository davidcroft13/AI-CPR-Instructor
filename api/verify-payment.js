// API endpoint for verifying Stripe payments
// This should be deployed as a serverless function

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      // Payment was successful
      // The webhook should have already handled updating the database
      // This endpoint just verifies the payment status
      return res.status(200).json({ 
        success: true,
        paymentStatus: session.payment_status,
      });
    } else {
      return res.status(200).json({ 
        success: false,
        paymentStatus: session.payment_status,
        message: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ error: error.message || 'Failed to verify payment' });
  }
}

