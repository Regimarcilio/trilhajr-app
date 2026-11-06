/**
 * Serviço de integração com APIs Rezi
 * Conecta com a API REST do serviço Rezi para geração de currículos
 */

import axios, { AxiosInstance } from 'axios';

const REZI_API_URL = 'https://api.rezi.ai/v1';

const api: AxiosInstance = axios.create({
  baseURL: REZI_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  title: string;
  experience: string;
  skills: string;
  education: string;
}

export interface ATSResult {
  overallScore: number;
  formatScore: number;
  keywordScore: number;
  structureScore: number;
  suggestions: string[];
}

export const ResumeService = {
  /**
   * Gera currículo otimizado via API Rezi
   */
  generateResume: async (data: ResumeData): Promise<string> => {
    const response = await api.post('/resume/generate', data);
    return response.data.resumeUrl;
  },

  /**
   * Valida currículo contra padrões ATS
   */
  validateATS: async (resumeText: string): Promise<ATSResult> => {
    const response = await api.post('/ats/validate', { content: resumeText });
    return response.data;
  },

  /**
   * Busca vagas compatíveis via análise de palavras-chave
   */
  findJobs: async (skills: string[]): Promise<any[]> => {
    const response = await api.post('/jobs/match', { keywords: skills.split(',') });
    return response.data.jobs;
  },
};