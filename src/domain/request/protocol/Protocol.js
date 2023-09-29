export const protocolTypes = {
  preliminary: 'preliminary',
  transmissive: 'transmissive'
};

export class Protocol {
  constructor(
    id,
    fuelAvailable,
    kilometersTravelled,
    clientName,
    clientNumber,
    clientSignature = '',
    driverSignature = '',
    checks = {}
  ) {
    this.id = id;
    this.setFuelAvailable(fuelAvailable);
    this.kilometersTravelled = kilometersTravelled;
    this.clientName = clientName;
    this.clientNumber = clientNumber;
    this.clientSignature = clientSignature;
    this.driverSignature = driverSignature;
    this.checks = checks;
  }

  setFuelAvailable(fuelAvailable) {
    if (!Number.isInteger(fuelAvailable)
        || fuelAvailable < 0 || fuelAvailable > 100) {
      throw new Error('Invalid fuel!');
    }
    this.fuelAvailable = fuelAvailable;
  }
}
