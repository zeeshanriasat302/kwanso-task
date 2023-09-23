import express from 'express';
import { check } from 'express-validator';
import * as usersController from '../controllers/user.controller';
import authMiddleware from '../middleware/auth';

const router = express.Router();

let validateRegister = [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
]
// register user
router.post(
    '/register',
    validateRegister,
    usersController.signup
);
// login user
router.post('/login', usersController.login);
// get all users
router.get('/', authMiddleware, usersController.getUsers); // Users
// get user by id
router.get('/:userId', authMiddleware, usersController.getUserById); // Users


export default router;
