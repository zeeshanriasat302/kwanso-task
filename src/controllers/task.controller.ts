import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import HttpError from '../models/http-error';
import Task from '../models/task';
import User from '../models/user';
import mongoose from 'mongoose';

// create task
const createTask = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { taskName, creator } = req.body;

    const createdTask = new Task({
        taskName,
        creator,
    });

    let user = null;

    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating task failed, please try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('User not found for provided id', 404);
        return next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const savedTask = await createdTask.save({ session });

        user.tasks.push(savedTask._id);
        await user.save({ session });

        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError('DB connection failed, please try again.', 500);
        return next(error);
    }

    res.status(201).json({ task: createdTask.toObject() });
};

// get tasks by user id
const getTaskByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.params.userId;
  
    try {
      const userWithTask = await User.findById(userId)
        .populate('tasks')
        .lean();
  
      if (!userWithTask || userWithTask.tasks.length === 0) {
        return next(
          new HttpError('Could not find tasks for the provided user id.', 404)
        );
      }
  
      res.json({
        tasks: userWithTask.tasks.map((task: any) => ({
          id: task._id,
          name: task.taskName,
        })),
      });
    } catch (err) {
      const error = new HttpError(
        'Fetching tasks failed, please try again later',
        500
      );
      return next(error);
    }
  };
    


export { createTask, getTaskByUserId };
