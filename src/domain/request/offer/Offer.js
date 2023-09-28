export class Offer {
  constructor(id, title, requestId, isAccepted = false, items = []) {
    this.id = id;
    this.title = title;
    this.isAccepted = isAccepted;
    this.requestId = requestId;
    this.setItems(items);
  }

  setItems(items) {
    if (items.some((item) => item.offerId !== this.id)) {
      throw new Error('Invalid items for offer!');
    }
    this.items = items;
  }
}
