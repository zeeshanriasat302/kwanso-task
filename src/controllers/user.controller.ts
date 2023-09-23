import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import HttpError from '../config/http-error';
import User from '../models/user';

export interface IUser extends Document {
    id: string
    email: string;
    password: string;
    tasks: [],
    toObject(): any;
}

// user registration
const signup = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User exists already, please login instead.', 422);
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError('Could not create user, please try again.', 500);
        return next(error);
    }

    const createdUser = new User({
        email,
        password: hashedPassword,
        tasks: [],
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    res.status(201).json({ user: { id: createdUser.id, email: createdUser.email } });

};

// user login
const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    let existingUser: IUser;

    try {
        existingUser = (await User.findOne({ email: email })) as IUser;
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later.', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('Invalid credentials, could not log you in.', 401);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError(
            'Could not log you in, please check your credentials and try again.',
            500
        );
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials, could not log you in.', 401);
        return next(error);
    }

    let token: string;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            'supersecret_dont_share',
            { expiresIn: '5h' }
        );
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later.', 500);
        return next(error);
    }

    res.json({
        message: 'login Successful',
        jwt: token,
    });
};

// get all users
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    let users: IUser[];
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later.', 500);
        return next(error);
    }
    res.json({
        users: users.map((user) => {
          return {
            id: user.id,
            email: user.email,
            tasks: user.tasks, // Assuming user.tasks is an array
          };
        }),
      });};

// get user by id
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    let user: IUser | null;
    try {
        user = await User.findById(userId, '-password');
    } catch (err) {
        const error = new HttpError('Fetching user failed, please try again later.', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('User not found for the provided ID.', 404);
        return next(error);
    }

    res.json({ user: { id: user.id, email: user.email } });
};

export { getUsers, getUserById, signup, login };
