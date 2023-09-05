export const createAuthControllerFunctions = (authController) => ({
  login: authController.login.bind(authController),
  logout: authController.logout.bind(authController)
});
