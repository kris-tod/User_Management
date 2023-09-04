import express from 'express';
import FileService from '../../services/FileService.js';
import { EndUserController } from '../controllers/EndUserController.js';

import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isEndUser,
  uploader,
  isFileValid
} from '../middlewares/index.js';

const router = express.Router();
const endUserController = new EndUserController();

router.get(
  '/',
  isAuth,
  isTokenNew,
  endUserController.getOne.bind(endUserController)
);

router.patch(
  '/username',
  isUsernameValid,
  isAuth,
  isTokenNew,
  endUserController.update.bind(endUserController)
);

router.patch(
  '/email',
  isEmailValid,
  isAuth,
  isTokenNew,
  endUserController.update.bind(endUserController)
);

router.patch(
  '/password',
  isPasswordValid,
  isAuth,
  isTokenNew,
  endUserController.update.bind(endUserController)
);

router.post(
  '/friends',
  isAuth,
  isTokenNew,
  isEndUser,
  endUserController.addFriend.bind(endUserController)
);

router.post(
  '/avatar',
  isAuth,
  isTokenNew,
  uploader.single('avatar'),
  isFileValid(FileService),
  endUserController.updateAvatar.bind(endUserController)
);

router.delete(
  '/friends',
  isAuth,
  isTokenNew,
  isEndUser,
  endUserController.removeFriend.bind(endUserController)
);

export const endUserRouter = router;
