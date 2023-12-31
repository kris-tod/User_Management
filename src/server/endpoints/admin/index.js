import { Router } from 'express';
import { createUsersRouter } from './users/usersRouter.js';
import { createAdminAuthRouter } from './auth/adminAuthRouter.js';
import { createProfileRouter } from './profile/profileRouter.js';
import { createAdminsRouter } from './admins/adminsRouter.js';
import { createOrganizationsRouter } from './organizations/organizationsRouter.js';
import { createPartnersRouter } from './partners/partnersRouter.js';
import { createServicesRouter } from './services/servicesRouter.js';
import { createSubscriptionPlansRouter } from './subscriptionPlans/subscriptionPlansRouter.js';
import { createRegionsRouter } from './regions/regionsRouter.js';
import { createDriversRouter } from './drivers/driversRouter.js';
import { createRequestsRouter } from './requests/requestsRouter.js';
import { createOffersRouter } from './offers/offersRouter.js';
import { createWorkCardsRouter } from './workCards/workCardsRouter.js';

export const createAdminRouter = (logger) => {
  const router = Router();
  router.use('/users', createUsersRouter(logger));
  router.use('/auth', createAdminAuthRouter(logger));
  router.use('/profile', createProfileRouter(logger));
  router.use('/admins', createAdminsRouter(logger));
  router.use('/organizations', createOrganizationsRouter(logger));
  router.use('/partners', createPartnersRouter(logger));
  router.use('/services', createServicesRouter(logger));
  router.use('/subscriptionPlans', createSubscriptionPlansRouter(logger));
  router.use('/regions', createRegionsRouter(logger));
  router.use('/drivers', createDriversRouter(logger));
  router.use('/requests', createRequestsRouter(logger));
  router.use('/offers', createOffersRouter(logger));
  router.use('/work-cards', createWorkCardsRouter(logger));

  return router;
};
