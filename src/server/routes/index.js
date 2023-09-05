import { Router } from 'express';
import { usersRouter } from './users.js';
import { authRouter } from './auth.js';
import { userRouter } from './user.js';

export const router = Router();
router.use('/users', usersRouter);
router.use('/user', userRouter);
router.use('/auth', authRouter);
