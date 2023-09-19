export class SubscriptionPlan {
  constructor(
    id,
    name,
    price,
    commissionPerRequest,
    carsLimit,
    isDefault = false,
    description = ''
  ) {
    this.id = id;
    this.name = name;
    this.setPrice(price);
    this.commissionPerRequest = commissionPerRequest;
    this.setCarsLimit(carsLimit);
    this.isDefault = isDefault;
    this.description = description;
  }

  setPrice(price) {
    if (price <= 0) {
      throw new Error('Invalid subscription price!');
    }
    this.price = price;
  }

  setCarsLimit(carsLimit) {
    if (carsLimit <= 0) {
      throw new Error('Invalid cars count!');
    }
    this.carsCount = carsLimit;
  }
}
