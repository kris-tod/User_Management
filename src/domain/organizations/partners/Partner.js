export class Partner {
  constructor(
    id,
    name,
    logo,
    address,
    phone,
    contactPerson,
    region,
    subscriptionPlan,
    organizationId,
    description = '',
    coordinates = '',
    carSupportServices = [],
    partnerAdmins = [],
    cars = []
  ) {
    this.id = id;
    this.name = name;
    this.logo = logo;
    this.description = description;
    this.address = address;
    this.coordinates = coordinates;
    this.phone = phone;
    this.contactPerson = contactPerson;
    this.region = region;
    this.subscriptionPlan = subscriptionPlan;
    this.services = carSupportServices;
    this.admins = partnerAdmins;
    this.cars = cars;
    this.organizationId = organizationId;
  }
}
