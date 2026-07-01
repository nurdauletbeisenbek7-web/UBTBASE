import type { Subject } from "./types";

export const SUBJECTS: { id: Subject; name: string; description: string }[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Algebra, geometry, statistics, and more",
  },
  {
    id: "informatics",
    name: "Informatics",
    description: "Programming, algorithms, databases, and IT fundamentals",
  },
];

export const QUESTIONS_PER_TEST = 20;

export const SUBJECT_LABELS: Record<Subject, string> = {
  mathematics: "Mathematics",
  informatics: "Informatics",
};
