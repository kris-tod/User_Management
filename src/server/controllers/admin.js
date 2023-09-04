import UserService from '../../services/UserService.js';

import {
  USER_CREATED,
  PASSWORD_UPDATED,
  USER_DELETED
} from '../../constants/messages.js';

export const get = {
  users: async (req, res) => {
    const { page } = req.query;

    const data = await UserService.getAll(page);
    res.status(200).json(data);
  }
};

export const post = {
  user: async (req, res) => {
    const {
      username, email, password, role
    } = req.body;

    await UserService.createUser(username, password, role, email);
    res.status(200).json({
      message: USER_CREATED
    });
  }
};
export const patch = {
  password: async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    await UserService.updatePasswordById(id, password);
    res.status(200).json({
      message: PASSWORD_UPDATED
    });
  }
};

export const destroy = {
  user: async (req, res) => {
    const { id } = req.params;

    await UserService.deleteById(id);
    res.status(200).json({
      message: USER_DELETED
    });
  }
};
