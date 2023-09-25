import { Router } from 'express';
import { createDriverAuthRouter } from './auth/driverAuthRouter.js';
import { createProfileRouter } from './profile/profileRouter.js';
import { createPartnersRouter } from './partners/partnersRouter.js';
import { createRequestsRouter } from './requests/requestsRouter.js';

export const createDriverRouter = (logger) => {
  const router = Router();
  router.use('/auth', createDriverAuthRouter(logger));
  router.use('/profile', createProfileRouter(logger));
  router.use('/partners', createPartnersRouter(logger));
  router.use('/requests', createRequestsRouter(logger));

  return router;
};
