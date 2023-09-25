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
    notes = ''
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
  }

  setStatus(status) {
    if (!requestStatuses.includes(status)) {
      throw new Error('Invalid status!');
    }
    this.status = status;
  }
}
