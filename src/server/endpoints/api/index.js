import { Router } from 'express';
import { createMobileAuthRouter } from './auth/mobileAuthRouter.js';
import { createProfileRouter } from './profile/profileRouter.js';

export const createMobileRouter = (logger) => {
  const router = Router();
  router.use('/auth', createMobileAuthRouter(logger));
  router.use('/profile', createProfileRouter(logger));

  return router;
};
