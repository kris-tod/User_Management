export const serializeUser = ({
  id,
  username,
  email,
  avatar,
  role,
  friendsList,
  region,
  cars
}) => ({
  id,
  username,
  email,
  avatar,
  role,
  friendsList,
  region,
  cars
});

export const serializeUsers = (users) => users.map((user) => serializeUser(user));
