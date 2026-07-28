export interface Prompt {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: number;
}

export interface IdeationSubmission {
  id: string;
  appName: string;
  problem: string;
  solution: string;
  targetAudience: string;
  keyFeatures: string[];
  themeColor: string;
  createdAt: number;
  docs?: Record<string, string>;
}

export type Category = string;

export const DEFAULT_CATEGORIES: Category[] = ['Coding', 'Writing', 'General', 'Creative', 'Business', 'Marketing'];
