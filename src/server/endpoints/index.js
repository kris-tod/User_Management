import { Router } from 'express';
import { createMobileRouter } from './api/index.js';
import { createAdminRouter } from './admin/index.js';
import { createDriverRouter } from './driver/index.js';

export const createRouter = (logger) => {
  const router = Router();
  router.use('/admin', createAdminRouter(logger));
  router.use('/api', createMobileRouter(logger));
  router.use('/driver', createDriverRouter(logger));

  return router;
};
