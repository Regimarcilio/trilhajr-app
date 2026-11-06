import jwt from 'jsonwebtoken';

/**
 * Gera token JWT para autenticação
 * @param userId - ID do usuário
 * @param email - Email do usuário
 * @param pdfId - ID do PDF (opcional)
 * @param expiresIn - Tempo de expiração (default: 7 dias)
 */
export const generateToken = (
  userId: string,
  email: string,
  pdfId?: string,
  expiresIn: string = '7d'
): string => {
  const payload = {
    userId,
    email,
    ...(pdfId && { pdfId })
  };

  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não configurado no ambiente');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn });
};

/**
 * Verifica se o ambiente é de produção
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Verifica se as credenciais estão configuradas
 */
export const validateEnvironment = (): { valid: boolean; missing: string[] } => {
  const required = [
    'JWT_SECRET',
    'PAGSEGURO_EMAIL',
    'PAGSEGURO_TOKEN'
  ];
  
  const missing: string[] = [];
  
  for (const env of required) {
    const value = process.env[env];
    if (!value || value.includes('placeholder') || value.includes('seu-')) {
      missing.push(env);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
};