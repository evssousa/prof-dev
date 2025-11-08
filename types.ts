import type React from 'react';

export enum View {
  Home = 'home',
  Chat = 'chat',
  Practice = 'practice',
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  // FIX: Use React.ReactElement to resolve JSX namespace error in a .ts file.
  icon: React.ReactElement;
  topics: string[];
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export enum Difficulty {
  Easy = 'Fácil',
  Medium = 'Médio',
  Hard = 'Difícil',
  Hardcore = 'Hardcore',
}

export interface HardcoreChallenge {
  description: string;
  functionSignature: string; // Ex: "function somar(a, b)"
  testCases: {
    input: any[];
    output: any;
  }[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  description: string;
}
