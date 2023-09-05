export const createBaseControllerFunctions = (baseController) => ({
  getMany: baseController.getMany.bind(baseController),
  getOne: baseController.getOne.bind(baseController),
  update: baseController.update.bind(baseController),
  create: baseController.create.bind(baseController),
  destroy: baseController.destroy.bind(baseController)
});
