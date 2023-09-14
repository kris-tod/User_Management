import { BaseEntity } from '../../../utils/BaseEntity.js';

export const types = ['winter', 'summer', 'allseasons'];

export class Tire extends BaseEntity {
  constructor(
    id,
    brand,
    count,
    width,
    ratio,
    type,
    used,
    carId,
    comment = '',
    tiresHotel = ''
  ) {
    super(id);
    this.brand = brand;
    this.count = count;
    this.width = width;
    this.ratio = ratio;
    this.setType(type);
    this.used = used;
    this.carId = carId;
    this.comment = comment;
    this.tiresHotel = tiresHotel;
  }

  setType(type) {
    if (!types.includes(type)) {
      throw new Error('Invalid tire type!');
    }
    this.type = type;
  }
}
