export const serializeUser = ({
  id,
  username,
  email,
  avatar,
  role,
  friendsList = [],
  region,
  cars = [],
  favouritePartners = []
}) => ({
  id,
  username,
  email,
  avatar,
  role,
  friendsList,
  region,
  cars,
  favouritePartners: favouritePartners.map((partner) => partner.name)
});

export const serializeAdmin = ({
  id, username, email, region
}) => ({
  id, username, email, region
});

export const serializeAdmins = (admins) => admins.map((admin) => serializeAdmin(admin));

export const serializeUsers = (users) => users.map((user) => serializeUser(user));

export const serializeCar = (car) => ({
  ...car,
  id: parseInt(car.id, 10)
});

export const serializeCars = (cars) => cars.map((car) => serializeCar(car));
