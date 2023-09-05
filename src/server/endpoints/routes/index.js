import { Router } from 'express';
import { usersRouter } from './users/users.js';
import { authRouter } from './auth/auth.js';
import { userRouter } from './user/user.js';

export const router = Router();
router.use('/users', usersRouter);
router.use('/user', userRouter);
router.use('/auth', authRouter);
