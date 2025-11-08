// Stripe webhook handler for payment events
// This should be deployed as a serverless function and configured in Stripe Dashboard
// Webhook URL: https://your-domain.com/api/stripe-webhook
//
// Required Stripe webhook events to listen for:
// - checkout.session.completed
// - payment_intent.succeeded

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Update payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          stripe_payment_intent_id: session.payment_intent,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_checkout_session_id', session.id);

      if (paymentError) {
        console.error('Error updating payment:', paymentError);
      }

      // Update user payment status
      if (session.metadata && session.metadata.userId) {
        const { error: userError } = await supabase
          .from('users')
          .update({ payment_status: 'paid' })
          .eq('id', session.metadata.userId);

        if (userError) {
          console.error('Error updating user:', userError);
        }
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Additional payment processing if needed
      console.log('PaymentIntent succeeded:', paymentIntent.id);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

