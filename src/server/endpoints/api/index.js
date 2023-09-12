import { Router } from 'express';
import { createMobileAuthRouter } from './auth/mobileAuthRouter.js';

export const createMobileRouter = (logger) => {
  const router = Router();
  router.use('/auth', createMobileAuthRouter(logger));

  return router;
};
