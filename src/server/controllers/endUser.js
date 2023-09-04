import fs from 'fs';
import UserService from '../../services/UserService.js';

import { staticDirname } from '../../config/index.js';

import {
  ADDED_FRIEND,
  USERNAME_UPDATED,
  PASSWORD_UPDATED,
  EMAIL_UPDATED,
  REMOVED_FRIEND,
  AVATAR_ADDED
} from '../../constants/messages.js';

export const get = {
  myInfo: async (req, res) => {
    const id = req.userId;

    const user = await UserService.getWholeInfoById(id);
    res.status(200).json(user);
  }
};
export const post = {
  addFriend: async (req, res) => {
    const id = req.userId;
    const { friendUsername } = req.body;

    await UserService.addFriend(id, friendUsername);
    res.status(200).json({
      message: ADDED_FRIEND
    });
  },
  avatar: async (req, res, next) => {
    const id = req.userId;
    const { filePath, file } = req;

    try {
      await UserService.updateAvatarById(id, filePath);

      res.status(200).json({
        message: AVATAR_ADDED
      });
    }
    catch (err) {
      fs.unlinkSync(`${staticDirname}/${file.filename}`);
      next(err);
    }
  }
};
export const patch = {
  username: async (req, res) => {
    const id = req.userId;
    const { username } = req.body;

    await UserService.updateUsernameById(id, username);
    res.status(200).json({
      message: USERNAME_UPDATED
    });
  },
  email: async (req, res) => {
    const id = req.userId;
    const { email } = req.body;

    await UserService.updateEmailById(id, email);
    res.status(200).json({
      message: EMAIL_UPDATED
    });
  },
  password: async (req, res) => {
    const id = req.userId;
    const { password } = req.body;

    await UserService.updatePasswordById(id, password);
    res.status(200).json({
      message: PASSWORD_UPDATED
    });
  }
};
export const destroy = {
  removeFriend: async (req, res) => {
    const id = req.userId;
    const { friendUsername } = req.body;

    await UserService.removeFriend(id, friendUsername);
    res.status(200).json({
      message: REMOVED_FRIEND
    });
  }
};
