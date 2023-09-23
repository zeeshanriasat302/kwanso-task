import express from 'express';
import { check } from 'express-validator';
import authMiddleware from '../middleware/auth';
import * as taskController from '../controllers/task.controller';

const router = express.Router();
router.use(authMiddleware);

let createTaskValidator =   [
    check('taskName').not().isEmpty(),
  ]

// Create Task Route
router.post(
  '/create-task',
  createTaskValidator,
  taskController.createTask
);
// get user tasks
router.get('/list-tasks/:userId', taskController.getTaskByUserId)


export default router;
