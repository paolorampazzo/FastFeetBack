// Realiza a conexao com o banco de dados e carrega nossos models
import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import User from '../app/models/User';
import Recipient from '../app/models/Recipient';
import File from '../app/models/File';
import Signature from '../app/models/Signature';
import Courier from '../app/models/Courier';
import Handout from '../app/models/Handout';

const models = [User, Recipient, File, Signature, Courier, Handout];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // Conexao com o banco de dados
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
