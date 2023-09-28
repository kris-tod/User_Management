export class WorkCard {
  constructor(id, items = []) {
    this.id = id;
    this.setItems(items);
  }

  setItems(items) {
    if (items.some((item) => item.workCardId !== this.id)) {
      throw new Error('Items do not belong to work card!');
    }
    this.items = items;
  }
}
