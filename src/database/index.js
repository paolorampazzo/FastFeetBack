// Realiza a conexao com o banco de dados e carrega nossos models
import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import User from '../app/models/User';

const models = [User];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // Conexao com o banco de dados
    this.connection = new Sequelize(databaseConfig);
    models.map(model => model.init(this.connection));
  }
}

export default new Database();
