import express from 'express';
import { PartnersController } from './PartnersController.js';
import {
  isAuth,
  isTokenNew,
  isAdmin,
  isFromApp,
  isFileValid,
  uploader
} from '../../../middlewares/index.js';
import { apps } from '../../../../constants/apps.js';

export const createPartnersRouter = (logger) => {
  const router = express.Router();
  const partnersController = new PartnersController(logger);
  const {
    getMany, getOne, create, update, destroy, updateLogo
  } = partnersController.createRouterHandlers();

  router.get(
    '/',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    getMany
  );

  router.get(
    '/:id',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    getOne
  );

  router.post(
    '/',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    create
  );

  router.post(
    '/:id/logo',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    uploader.single('logo'),
    isFileValid,
    updateLogo
  );

  router.patch(
    '/:id',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    update
  );

  router.delete(
    '/:id',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    destroy
  );

  return router;
};
