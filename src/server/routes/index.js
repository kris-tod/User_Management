import { Router } from 'express';
import { usersRouter } from '../endpoints/users/usersRouter.js';
import { authRouter } from '../endpoints/auth/authRouter.js';
import { userRouter } from '../endpoints/user/userRouter.js';

export const router = Router();
router.use('/users', usersRouter);
router.use('/user', userRouter);
router.use('/auth', authRouter);
