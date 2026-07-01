import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Инициализируем Gemini с помощью ключа из переменных окружения
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { question, answer, correctAnswer, explanation } = await req.json();

    // Формируем четкий промпт для ИИ
    const prompt = `
      Ты — строгий бэкенд-модуль объяснения ошибок в тестах. 
  Твоя задача — дать максимально краткий, сухой и технический разбор.
  
  ЗАПРЕЩЕНО: Приветствовать пользователя, использовать фразы вроде "Не переживай", "Отличная попытка", делать вступления и выводы.
  ЕСЛИ данные пустые или некорректные — напиши просто: "Ошибка: данные вопроса не переданы".
  
  ДАННЫЕ ДЛЯ РАЗБОРА:
  Вопрос: ${question || 'Не указан'}
  Неверный ответ пользователя: ${answer || 'Не указан'}
  Правильный ответ: ${correctAnswer || 'Не указан'}
  Контекст: ${explanation || 'Не указан'}
  
  Формат ответа:
  1. Почему ответ пользователя неверный (1-2 предложения).
  2. Почему правильный ответ верен (1-2 предложения).
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