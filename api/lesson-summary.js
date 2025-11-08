// Webhook endpoint for 11Labs to call when lesson is complete
// This would typically be deployed as a serverless function (e.g., Vercel, Netlify, Supabase Edge Function)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, lesson_id, summary, score } = req.body;

    if (!user_id || !lesson_id || !summary || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('lesson_results')
      .insert([
        {
          user_id,
          lesson_id,
          summary,
          score: parseFloat(score),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving lesson result:', error);
      return res.status(500).json({ error: 'Failed to save result' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in lesson-summary handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

