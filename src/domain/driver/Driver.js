export class Driver {
  constructor(
    id,
    name,
    password,
    avatar,
    number,
    region,
    partner,
    pushNotificationsToken,
    signature,
    description = ''
  ) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.avatar = avatar;
    this.description = description;
    this.number = number;
    this.region = region;
    this.partner = partner;
    this.pushNotificationsToken = pushNotificationsToken;
    this.signature = signature;
  }
}
