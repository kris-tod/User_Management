import { createBaseControllerFunctions } from './baseControllerFactory.js';

export const createUserControllerFunctions = (userController) => ({
  ...createBaseControllerFunctions(userController),
  updateAvatar: userController.updateAvatar.bind(userController)
});
