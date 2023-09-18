export const serializeUser = ({
  id,
  username,
  email,
  avatar,
  role,
  friendsList,
  region,
  cars,
  favouritePartners
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

export const serializeUsers = (users) => users.map((user) => serializeUser(user));

export const serializeCar = (car) => ({
  ...car,
  id: parseInt(car.id, 10)
});

export const serializeCars = (cars) => cars.map((car) => serializeCar(car));
