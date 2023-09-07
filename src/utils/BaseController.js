export class BaseController {
  constructor(service, identityName = 'id') {
    this.service = service;
    this.identityName = identityName;
  }

  async getMany(req, res) {
    const { page } = req.query;

    const collection = await this.service.getAll(page);
    res.status(200).json(collection);
  }

  async getOne(req, res) {
    const id = req.params[this.identityName];

    const entity = await this.service.getOne(id);
    res.status(200).json(entity);
  }

  async update(req, res) {
    const data = req.body;
    const id = req.params[this.identityName];

    const updatedData = await this.service.update(id, data);
    res.status(200).json(updatedData);
  }

  async create(req, res) {
    const data = req.body;

    const entity = await this.service.create(data);
    res.status(201).json(entity);
  }

  async destroy(req, res) {
    const id = req.params[this.identityName];

    await this.service.destroy(id);
    res.status(204).send('');
  }

  createRouterHandlers(methods) {
    const that = this;
    return methods.reduce((acc, curr) => {
      acc[curr] = that[curr].bind(that);
      return acc;
    }, {});
  }
}