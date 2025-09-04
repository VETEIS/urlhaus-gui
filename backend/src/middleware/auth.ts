import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    apiKey: string;
    authKey: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      apiKey: decoded.apiKey,
      authKey: decoded.apiKey
    };
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

export const authenticateApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['auth-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      error: 'API key required' 
    });
  }

  // For now, we'll accept any API key and store it in the request
  // In a real implementation, you'd validate against a database
  req.user = {
    id: 'temp-user',
    email: 'temp@example.com',
    apiKey: apiKey,
    authKey: apiKey
  };

  next();
};
