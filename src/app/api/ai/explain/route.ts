import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Инициализируем строго через переменную окружения
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    // Безопасно парсим JSON, если тело запроса пустое — берём пустой объект
    const body = await req.json().catch(() => ({}));
    const { question, answer, correctAnswer, explanation } = body;

    // Жёсткий и лаконичный промпт
    const prompt = `
      Ты — строгий бэкенд-модуль объяснения ошибок в тестах. 
      Твоя задача — дать максимально краткий, сухой и технический разбор.
      
      ЗАПРЕЩЕНО: Приветствовать пользователя, делать вступления и выводы.
      
      ДАННЫЕ ДЛЯ РАЗБОРА:
      Вопрос: ${question || 'Не указан'}
      Неверный ответ пользователя: ${answer || 'Не указан'}
      Правильный ответ: ${correctAnswer || 'Не указан'}
      Контекст: ${explanation || 'Не указан'}
      
      Формат ответа:
      1. Почему ответ пользователя неверный (1-2 предложения).
      2. Почему правильный ответ верен (1-2 предложения).
    `;

    // Вызываем стабильную модель
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const aiExplanation = response.text || 'Не удалось сгенерировать текст.';

    return NextResponse.json({ explanation: aiExplanation });
  } catch (error: any) {
    // Выводим ошибку в консоль Vercel для отладки
    console.error('Gemini API Ошибка:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation', details: error.message },
      { status: 500 }
    );
  }
}