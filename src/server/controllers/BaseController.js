export class BaseController {
  constructor(service, propertyName = 'id') {
    this.service = service;
    this.propertyName = propertyName;
  }

  async getAll(req, res) {
    const { page } = req.query;
    const result = await this.service.getAll(page);

    res.status(200).json(result);
  }

  async getOne(req, res) {
    const id = req.params[this.propertyName];
    const result = await this.service.getOne(id);

    res.status(200).json(result);
  }

  async update(req, res) {
    const data = req.body;
    const id = req.params[this.propertyName];

    const result = await this.service.update(id, data);

    res.status(200).json(result);
  }

  async create(req, res) {
    const data = req.body;

    const result = await this.service.create(data);
    res.status(201).json(result);
  }

  async destroy(req, res) {
    const id = req.params[this.propertyName];

    await this.service.destroy(id);

    res.status(204).send('');
  }
}
