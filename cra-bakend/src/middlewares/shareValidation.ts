
// =============================================
// src/middlewares/shareValidation.ts - Middleware de validation des tokens
// =============================================

import { Request, Response, NextFunction } from 'express';
import { isValidShareToken } from '../utils/shareUtils';

export const validateShareToken = (req: Request, res: Response, next: NextFunction) => {
  const { shareToken } = req.params;
  
  if (!shareToken || !isValidShareToken(shareToken)) {
    return res.status(400).json({
      success: false,
      message: 'Token de partage invalide'
    });
  }
  
  next();
};