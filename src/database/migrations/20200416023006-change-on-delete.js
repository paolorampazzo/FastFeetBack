module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('problems', 'delivery_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'handouts', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('problems', 'delivery_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'handouts', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }),
};
