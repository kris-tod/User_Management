import express from 'express';
import FileService from '../../../../services/FileService.js';
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
} from '../../../middlewares/index.js';
import { UserService } from '../../../../services/UserService.js';

const router = express.Router();

const userController = new UserController();
const friendsController = new FriendsController(UserService);

const {
  getOne, update, updateAvatar
} = userController.createRouterHandlers(['getOne', 'update', 'updateAvatar']);

const {
  addFriend,
  removeFriend
} = friendsController.createRouterHandlers(['addFriend', 'removeFriend']);

router.get(
  '/',
  isAuth,
  isTokenNew,
  getOne
);

router.patch(
  '/username',
  isUsernameValid,
  isAuth,
  isTokenNew,
  update
);

router.patch(
  '/email',
  isEmailValid,
  isAuth,
  isTokenNew,
  update
);

router.patch(
  '/password',
  isPasswordValid,
  isAuth,
  isTokenNew,
  update
);

router.post(
  '/friends',
  isAuth,
  isTokenNew,
  isEndUser,
  addFriend
);

router.post(
  '/avatar',
  isAuth,
  isTokenNew,
  uploader.single('avatar'),
  isFileValid(FileService),
  updateAvatar
);

router.delete(
  '/friends',
  isAuth,
  isTokenNew,
  isEndUser,
  removeFriend
);

export const userRouter = router;
