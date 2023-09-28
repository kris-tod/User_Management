export const requestStatuses = [
  'pending',
  'rejected',
  'accepted',
  'driver_at_address',
  'car_at_service',
  'car_ready',
  'car_driven',
  'done'
];

export class Request {
  constructor(
    id,
    address,
    carCoordinates,
    partner,
    service,
    car,
    driver,
    driveAlone,
    status,
    serialNumber = null,
    notes = '',
    offers = []
  ) {
    this.id = id;
    this.address = address;
    this.carCoordinates = carCoordinates;
    this.partner = partner;
    this.service = service;
    this.car = car;
    this.driver = driver;
    this.driveAlone = driveAlone;
    this.setStatus(status);
    this.serialNumber = serialNumber;
    this.notes = notes;
    this.setOffers(offers);
  }

  setStatus(status) {
    if (!requestStatuses.includes(status)) {
      throw new Error('Invalid status!');
    }
    this.status = status;
  }

  setOffers(offers) {
    if (offers.some((offer) => offer.requestId !== this.id)) {
      throw new Error('Invalid offers for request');
    }
    this.offers = offers;
  }
}
