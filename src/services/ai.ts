import { GoogleGenAI } from '@google/genai';

// Simple singleton or factory for the AI client
// In a real multi-agent scenario, this might need more robust config handling
export const getAIClient = () => {
    // In Vite, env vars are usually import.meta.env.VITE_xxx
    // But existing code used process.env.API_KEY, sticking to that if it works or shimming it
    const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    return new GoogleGenAI({ apiKey });
};
