import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const GUIDED_TONE_VOICE_ID = process.env.EXPO_PUBLIC_GUIDED_TONE_VOICE_ID || '';
const INTENSE_TONE_VOICE_ID = process.env.EXPO_PUBLIC_INTENSE_TONE_VOICE_ID || '';

export async function startScenario(lessonId, tone = 'guided') {
  const voiceId = tone === 'guided' ? GUIDED_TONE_VOICE_ID : INTENSE_TONE_VOICE_ID;
  
  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/conversation',
      {
        voice_id: voiceId,
        prompt: `Begin CPR training scenario ${lessonId}`,
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error starting scenario:', error);
    throw error;
  }
}

export async function sendMessage(conversationId, message) {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/conversation/${conversationId}/message`,
      { message },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

