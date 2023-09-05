import { createBaseControllerFunctions } from './baseControllerFactory.js';

export const createUsersControllerFunctions = (usersController) => ({
  ...createBaseControllerFunctions(usersController)
});
