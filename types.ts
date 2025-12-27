
export interface User {
  id: string;
  email: string;
  name: string;
  friends?: string[];
  credits?: number; // Scholar credits for competitiveness
}

export interface StudySource {
  id: string;
  category: 'syllabus' | 'notes' | 'textbook';
  title: string;
  type: 'text' | 'file';
  mimeType: string;
  content: string; 
  fileName: string;
}

export interface Reference {
  title: string;
  url: string;
  description: string;
}

export interface Concept {
  name: string;
  description: string;
  sourcesFoundIn: string[];
  priorityReasoning: string;
  tips: string;
  overlapIndex: number;
}

export interface SimplifiedExplanation {
  conceptName: string;
  simpleDefinition: string;
  analogy: string;
  realWorldExample: string;
}

export interface StudySession {
  id: string;
  userId: string;
  timestamp: number;
  guide: StudyGuideResponse;
  sources: StudySource[];
  rewardClaimed?: boolean; // Ensure reward is only given once per guide
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'easy' | 'moderate' | 'difficult';
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
  isCollaborative?: boolean;
  sessionId?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  userName: string;
  quizTitle: string;
  score: number;
  total: number;
  percentage: number;
  timeTaken: number;
  timestamp: number;
  sessionId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StudyGuideResponse {
  guideTitle: string;
  oracleMessage: string;
  highPriorityConcepts: Concept[];
  suggestedStudyPlan: string[];
  estimatedStudyTime: string;
  externalReferences: Reference[];
}
