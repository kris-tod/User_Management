export class Organization {
  constructor(id, name, description = '', partners = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.partners = partners;
  }
}
