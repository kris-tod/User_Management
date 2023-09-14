export const engineTypes = ['diesel', 'gasoline'];

export class Car {
  constructor(
    id,
    idNumber,
    image,
    brand,
    kilometers,
    engineType,
    tires = [],
    yearOfProduction = null,
    frameNumber = null,
    technicalReviewExpiration = Date(),
    civilEnsuranceExpiration = Date(),
    vignetteExpiration = Date(),
    autoEnsuranceExpiration = Date(),
    leasingExpiration = Date(),
    comment = '',
    vehicleType = ''
  ) {
    this.id = id;
    this.idNumber = idNumber;
    this.image = image;
    this.brand = brand;
    this.kilometers = kilometers;
    this.setEngineType(engineType);
    this.yearOfProduction = yearOfProduction;
    this.frameNumber = frameNumber;
    this.technicalReviewExpiration = technicalReviewExpiration;
    this.civilEnsuranceExpiration = civilEnsuranceExpiration;
    this.vignetteExpiration = vignetteExpiration;
    this.autoEnsuranceExpiration = autoEnsuranceExpiration;
    this.leasingExpiration = leasingExpiration;
    this.comment = comment;
    this.vehicleType = vehicleType;
    this.tires = tires;
  }

  setEngineType(engineType) {
    if (!engineTypes.includes(engineType)) {
      throw new Error('Invalid engine type!');
    }
    this.engineType = engineType;
  }
}
