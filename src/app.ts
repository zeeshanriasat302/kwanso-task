import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import HttpError from './models/http-error';
import taskRoutes from './routes/task.route';
import userRoutes from './routes/user.route';

const DB = process.env.DB_URL!;
const port = process.env.PORT || 5000; 


const app = express();

app.use(bodyParser.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = new HttpError('Could not find this route.', 404);
  next(error);
});

app.use((error: HttpError, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || 'An unknown error occurred' });
});

mongoose.set('strictQuery', false);

mongoose
  .connect(DB)
  .then(() => {
    app.listen(port);
    console.log('Running on port 5000');
  })
  .catch((err: Error) => {
    console.log(err);
  });
