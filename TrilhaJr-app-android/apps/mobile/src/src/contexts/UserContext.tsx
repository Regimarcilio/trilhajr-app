/**
 * Contexto global para gerenciamento de estado do usuário
 * Inclui sistema de níveis e XP (gameficação)
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LevelInfo {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
  badges: string[];
}

interface UserContextData {
  levelInfo: LevelInfo;
  currentResume: any;
  updateXP: (amount: number) => void;
  saveResume: (resume: any) => void;
  validateResumeATS: (resume: any) => Promise<number>;
}

const UserContext = createContext<UserContextData | undefined>(undefined);

const USER_LEVEL_XP: Record<number, number> = {
  1: 0,
  2: 1000,
  3: 3000,
  4: 6000,
  5: 10000,
  6: 15000,
  7: 21000,
  8: 28000,
  9: 36000,
  10: 45000,
};

const LEVEL_TITLES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Explorador',
  3: 'Candidato Premium',
  4: 'Especialista',
  5: 'Mestre dos Currículos',
  6: 'ATS Ninja',
  7: 'Recrutador Favorito',
  8: 'Estrela da Contratação',
  9: 'Lenda da Hiring',
  10: 'Rezi Rockstar',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    level: 3,
    xp: 2450,
    xpToNext: 3000,
    title: 'Candidato Premium',
    badges: ['java-badge', 'android-badge'],
  });

  const [currentResume, setCurrentResume] = useState<any>(null);

  const updateXP = (amount: number) => {
    setLevelInfo(prev => {
      const newXP = prev.xp + amount;
      const currentLevelXP = USER_LEVEL_XP[prev.level] || 0;
      const nextLevelXP = USER_LEVEL_XP[prev.level + 1] || Infinity;
      
      // Verifica se subiu de nível
      if (newXP >= nextLevelXP) {
        return {
          ...prev,
          level: prev.level + 1,
          xp: newXP,
          xpToNext: nextLevelXP,
          title: LEVEL_TITLES[prev.level + 1] || prev.title,
          badges: [...prev.badges, `level-${prev.level + 1}-badge`],
        };
      }
      
      return { ...prev, xp: newXP };
    });
  };

  const saveResume = (resume: any) => {
    setCurrentResume(resume);
    updateXP(50); // XP por salvar currículo
  };

  const validateResumeATS = async (resume: any): Promise<number> => {
    // Simulação de validação IoT/Edge
    let score = 50;
    
    if (resume.skills && resume.skills.length > 10) score += 20;
    if (resume.experience && resume.experience.length > 200) score += 15;
    if (resume.title) score += 15;
    
    const finalScore = Math.min(score, 95);
    updateXP(finalScore * 10); // XP por pontuação ATS
    
    return finalScore;
  };

  return (
    <UserContext.Provider value={{
      levelInfo,
      currentResume,
      updateXP,
      saveResume,
      validateResumeATS,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};