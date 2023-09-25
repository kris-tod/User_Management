export const adminRoles = ['admin', 'superadmin', 'partneradmin'];

export class Admin {
  constructor(
    id,
    username,
    password,
    role = 'admin',
    region = null,
    email = ''
  ) {
    this.id = id;
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
}
