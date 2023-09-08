export const serializeUser = ({
  id,
  username,
  email,
  avatar,
  role,
  friendsList
}) => ({
  id,
  username,
  email,
  avatar,
  role,
  friendsList
});

export const serializeUsers = (users) => users.map((user) => serializeUser(user));
