import { Router } from 'express';
import { createUsersRouter } from './users/usersRouter.js';
import { createAdminAuthRouter } from './auth/adminAuthRouter.js';
import { createUserRouter } from '../api/user/userRouter.js';

export const createAdminRouter = (logger) => {
  const router = Router();
  router.use('/users', createUsersRouter(logger));
  router.use('/auth', createAdminAuthRouter(logger));
  router.use('/user', createUserRouter(logger));

  return router;
};
