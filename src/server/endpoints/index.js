import { Router } from 'express';
import { createMobileRouter } from './api/index.js';
import { createAdminRouter } from './admin/index.js';

export const createRouter = (logger) => {
  const router = Router();
  router.use('/admin', createAdminRouter(logger));
  router.use('/api', createMobileRouter(logger));

  return router;
};
