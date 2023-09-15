export class SubscriptionPlan {
  constructor(
    id,
    name,
    price,
    commissionPerRequest,
    carsCount,
    isDefault = false,
    description = ''
  ) {
    this.id = id;
    this.name = name;
    this.setPrice(price);
    this.commissionPerRequest = commissionPerRequest;
    this.setCarsCount(carsCount);
    this.isDefault = isDefault;
    this.description = description;
  }

  setPrice(price) {
    if (price <= 0) {
      throw new Error('Invalid subscription price!');
    }
    this.price = price;
  }

  setCarsCount(carsCount) {
    if (carsCount <= 0) {
      throw new Error('Invalid cars count!');
    }
    this.carsCount = carsCount;
  }
}
