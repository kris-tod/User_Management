import { Router } from 'express';
import { createUsersRouter } from '../endpoints/users/usersRouter.js';
import { createAuthRouter } from '../endpoints/auth/authRouter.js';
import { createUserRouter } from '../endpoints/user/userRouter.js';

export const createRouter = (logger) => {
  const router = Router();
  router.use('/users', createUsersRouter(logger));
  router.use('/user', createUserRouter(logger));
  router.use('/auth', createAuthRouter(logger));

  return router;
};
