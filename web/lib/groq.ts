import Groq from 'groq-sdk';

let groqInstance: Groq | null = null;

export function getGroq(): Groq {
  if (!groqInstance) {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('Groq API key not configured (GROQ_API_KEY env var missing)');
    }
    
    groqInstance = new Groq({ apiKey });
  }
  return groqInstance;
}

export function hasGroq(): boolean {
  return !!process.env.GROQ_API_KEY;
}
