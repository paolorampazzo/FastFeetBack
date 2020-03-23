module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('couriers', 'isactive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }),

  down: queryInterface => queryInterface.removeColumn('couriers', 'isactive'),
};
