// import { ElevenLabsClient } from 'elevenlabs';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
// import { getAllAgentFromUser11lab } from '../auth/authService';

import 'dotenv/config';

const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_API_KEY_PERSONAL });


export const getCalls11labs = async (userId: string) => {
  try {
    const list = await client.conversationalAi.conversations.list();
    return list;
  } catch (error){
    console.error('Error fetching Elevenlabs conversations for agents')
  }
 }

export const getCall11labs = async (conversationId: string) => {
  try {
    const result = await client.conversationalAi.conversations.get(conversationId);
    return result;
  } catch (error) {
    console.error('Error fetching ElevenLabs conversation:', error);
    throw error;
  }
};
