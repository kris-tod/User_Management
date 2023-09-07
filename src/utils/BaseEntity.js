export class BaseEntity {
  constructor(id) {
    this.id = id;
  }

  equals(entity) {
    if (!entity || !entity.id) {
      return false;
    }

    return this.id === entity.id;
  }
}
