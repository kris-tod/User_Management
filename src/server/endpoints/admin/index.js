import { Router } from 'express';
import { createUsersRouter } from './users/usersRouter.js';
import { createAdminAuthRouter } from './auth/adminAuthRouter.js';
import { createUserRouter } from './user/adminRouter.js';
import { createAdminsRouter } from './admins/adminsRouter.js';
import { createOrganizationsRouter } from './organizations/organizationsRouter.js';
import { createPartnersRouter } from './partners/partnersRouter.js';
import { createServicesRouter } from './services/servicesRouter.js';
import { createSubscriptionsRouter } from './subscriptions/subscriptionsRouter.js';

export const createAdminRouter = (logger) => {
  const router = Router();
  router.use('/users', createUsersRouter(logger));
  router.use('/auth', createAdminAuthRouter(logger));
  router.use('/user', createUserRouter(logger));
  router.use('/admins', createAdminsRouter(logger));
  router.use('/organizations', createOrganizationsRouter(logger));
  router.use('/partners', createPartnersRouter(logger));
  router.use('/services', createServicesRouter(logger));
  router.use('/subscriptions', createSubscriptionsRouter(logger));

  return router;
};
