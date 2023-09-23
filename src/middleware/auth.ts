import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import HttpError from '../models/http-error';

// custom interface for the Request object with the 'userData' property.
interface CustomRequest extends Request {
  userData?: { userId: string };
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
     // Authorization: 'Bearer TOKEN'
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken: any = jwt.verify(token, 'supersecret_dont_share');
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    return next(error);
  }
};

export default authMiddleware;
