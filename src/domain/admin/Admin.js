import { BaseEntity } from '../../utils/BaseEntity.js';

export const adminRoles = ['admin', 'superadmin'];

export class Admin extends BaseEntity {
  constructor(
    id,
    username,
    password,
    role = 'admin',
    region = null,
    email = ''
  ) {
    super(id);
    this.username = username;
    this.password = password;
    this.setRole(role);
    this.region = region;
    this.email = email;
  }

  setRole(role) {
    if (!adminRoles.includes(role)) {
      throw new Error('Invalid admin role!');
    }
    this.role = role;
  }

  static build({
    id,
    username,
    password,
    role = 'admin',
    region = null,
    email = ''
  }) {
    return new Admin(id, username, password, role, region, email);
  }
}
