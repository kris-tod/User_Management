export class CarSupportService {
  constructor(
    id,
    name,
    image,
    region,
    isRegionDefault = false,
    isPromoted = false,
    description = ''
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.region = region;
    this.isRegionDefault = isRegionDefault;
    this.isPromoted = isPromoted;
  }
}
