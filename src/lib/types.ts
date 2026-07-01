export type Subject = "mathematics" | "informatics";

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Test {
  id: string;
  user_id: string;
  subject: Subject;
  score: number;
  total_questions: number;
  created_at: string;
}

export interface Answer {
  id: string;
  test_id: string;
  question_id: string;
  selected_answer: number;
  correct: boolean;
}

export interface AnswerWithQuestion extends Answer {
  questions: Question;
}

export interface TestSubmission {
  subject: Subject;
  answers: {
    questionId: string;
    selectedAnswer: number;
  }[];
}

export interface DashboardStats {
  totalTests: number;
  averageScore: number;
  weakTopics: { topic: string; wrongCount: number }[];
  recentResults: Test[];
}
