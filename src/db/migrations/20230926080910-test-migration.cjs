/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn('friendships', 'username');
    await queryInterface.removeColumn('friendships', 'friend_username');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('friendships', 'username', {
      type: Sequelize.DataTypes.STRING
    });
    await queryInterface.addColumn('friendships', 'friend_username', {
      type: Sequelize.DataTypes.STRING
    });
  }
};
