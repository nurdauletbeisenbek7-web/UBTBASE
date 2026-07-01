import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Инициализируем Gemini с помощью ключа из переменных окружения
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { question, answer, correctAnswer, explanation } = await req.json();

    // Формируем четкий промпт для ИИ
    const prompt = `
      Ты — лаконичный ИИ-помощник для подготовки к тестам. 
  Объясни коротко и доступно, почему ответ пользователя неверный, и обоснуй правильный вариант.
  
  Вопрос: ${question}
  Ответ пользователя: ${answer}
  Правильный ответ: ${correctAnswer}
  Базовое объяснение: ${explanation || 'Не указано'}
  
  Ответь строго кратко (максимум 2-3 небольших абзаца), без лишней "воды", приветствий и длинных вступлений. Используй markdown.
`;

    // Вызываем модель gemini-1.5-flash (она бесплатная и быстрая)
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const aiExplanation = response.text;

    return NextResponse.json({ explanation: aiExplanation });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation', details: error.message },
      { status: 500 }
    );
  }
}