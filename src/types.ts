export type StudyStatus = 'draft' | 'completed';

export interface BibleSelection {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  translation: string;
  text: string;
}

export interface Question {
  category: string;
  content: string;
}

export interface ContextAnalysis {
  historical?: string;
  cultural?: string;
  literary?: string;
}

export interface Study {
  id: string;
  userId: string;
  title: string;
  status: StudyStatus;
  bibleSelection?: BibleSelection;
  observations?: string;
  questions?: Question[];
  questionsText?: string;
  genre?: string;
  structure?: string;
  context?: ContextAnalysis;
  contextText?: string;
  mainIdea?: string;
  transformingIntent?: string;
  sermonOutline?: string;
  detailedSermon?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export type UserRole = 'guest' | 'student' | 'professor' | 'monitor' | 'contributor' | 'admin';

export interface Group {
  id: string;
  name: string;
  professorId: string;
  createdAt: number;
}

export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  age?: number;
  denomination?: string;
  role: UserRole;
  isContributor?: boolean;
  isApproved: boolean;
  groupIds?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface AiUsage {
  uid: string;
  studyId: string;
  queryCount: number;
  lastQueryAt: number;
}

export interface AcademyProgress {
  userId: string;
  completedLessons: string[]; // lesson ids
  quizScores: { [lessonId: string]: number };
  lastAccessedLessonId?: string;
  updatedAt: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string; // Markdown
  order: number;
  quiz?: QuizQuestion[];
}

export interface AcademyModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}
