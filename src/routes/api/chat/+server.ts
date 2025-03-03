import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { getLocalFirstContext } from '$lib/utils/localFirstContext';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = getLocalFirstContext();

export async function POST({ request }) {
  try {
    const { message, history } = await request.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      systemPrompt: SYSTEM_PROMPT,
      history: history.map((msg: ChatMessage) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    return json({ success: true, text });
  } catch (error) {
    console.error('Error:', error);
    return json({ 
      success: false, 
      text: 'Sorry, I encountered an error. Please try again.' 
    }, { status: 500 });
  }
} 