export const serializeUser = ({
  id,
  username,
  email,
  avatar,
  role,
  friendsList,
  region
}) => ({
  id,
  username,
  email,
  avatar,
  role,
  friendsList,
  region
});

export const serializeUsers = (users) => users.map((user) => serializeUser(user));
