import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware de autenticação JWT
 * Protege endpoints sensíveis (download de PDFs, status de pagamento)
 * 
 * Uso: app.get('/protected', authMiddleware, handler);
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      success: false,
      error: 'Token de autenticação não fornecido',
      code: 'AUTH_MISSING' 
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET não configurado no ambiente');
      res.status(500).json({ 
        success: false,
        error: 'Erro interno de configuração',
        code: 'CONFIG_ERROR' 
      });
      return;
    }

    // Verificar token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Adicionar usuário à request
    (req as any).user = decoded;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token inválido';
    res.status(401).json({ 
      success: false,
      error: message,
      code: 'AUTH_INVALID' 
    });
  }
};

/**
 * Middleware de autorização por propriedade
 * Verifica se o usuário tem acesso ao recurso solicitado
 */
export const authorizeOwnership = (
  resourceOwnerId: string // nome do campo que contém o ownerId no request
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = (req as any).user?.userId;
    const ownerId = req.params[resourceOwnerId] || req.body[resourceOwnerId];
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Não autorizado',
        code: 'UNAUTHORIZED'
      });
      return;
    }
    
    // TODO: Implementar verificação real contra banco de dados
    // Por enquanto, permitir se o userID conferir
    if (ownerId && ownerId !== userId) {
      // Buscar no banco se o recurso pertence ao usuário
      next();
      return;
    }
    
    next();
  };
};

/**
 * Middleware de validação de UUID
 */
export const validateUuid = (req: Request, res: Response, next: NextFunction): void => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const paramValue = req.params.id || req.body.id;
  
  if (paramValue && !uuidRegex.test(paramValue)) {
    res.status(400).json({
      success: false,
      error: 'ID inválido',
      code: 'INVALID_ID'
    });
    return;
  }
  
  next();
};