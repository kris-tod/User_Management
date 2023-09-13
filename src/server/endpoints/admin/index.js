import { Router } from 'express';
import { createUsersRouter } from './users/usersRouter.js';
import { createAdminAuthRouter } from './auth/adminAuthRouter.js';
import { createUserRouter } from './user/adminRouter.js';
import { createAdminsRouter } from './admins/adminsRouter.js';

export const createAdminRouter = (logger) => {
  const router = Router();
  router.use('/users', createUsersRouter(logger));
  router.use('/auth', createAdminAuthRouter(logger));
  router.use('/user', createUserRouter(logger));
  router.use('/admins', createAdminsRouter(logger));

  return router;
};
