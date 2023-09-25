export class Organization {
  constructor(id, name, description = '', partners = [], admins = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.partners = partners;
    this.admins = admins;
  }
}
