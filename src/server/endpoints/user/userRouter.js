import express from 'express';
import { UserController } from './UserController.js';
import { FriendsController } from './FriendsController.js';

import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isEndUser,
  uploader,
  isFileValid
} from '../../middlewares/index.js';

export const createUserRouter = (logger) => {
  const router = express.Router();
  const userController = new UserController(logger);
  const friendsController = new FriendsController(logger);

  const { getOne, update, updateAvatar } = userController.createRouterHandlers();

  const { addFriends } = friendsController.createRouterHandlers();

  router.get('/', isAuth, isTokenNew(logger), getOne);

  router.patch(
    '/',
    isUsernameValid,
    isPasswordValid,
    isEmailValid,
    isAuth,
    isTokenNew(logger),
    update
  );

  router.post('/friends', isAuth, isTokenNew(logger), isEndUser, addFriends);

  router.post(
    '/avatar',
    isAuth,
    isTokenNew(logger),
    uploader.single('avatar'),
    isFileValid,
    updateAvatar
  );

  return router;
};
