export const createFriendsControllerFunctions = (friendsController) => ({
  addFriend: friendsController.addFriend.bind(friendsController),
  removeFriend: friendsController.removeFriend.bind(friendsController)
});
