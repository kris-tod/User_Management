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
  favouritePartners
});

export const serializeUsers = (users) => users.map((user) => serializeUser(user));
