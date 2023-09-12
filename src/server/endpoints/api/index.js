import { Router } from 'express';
import { createMobileAuthRouter } from './auth/mobileAuthRouter.js';
import { createUserRouter } from './user/userRouter.js';

export const createMobileRouter = (logger) => {
  const router = Router();
  router.use('/auth', createMobileAuthRouter(logger));
  router.use('/user', createUserRouter(logger));

  return router;
};
