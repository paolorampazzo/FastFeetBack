// Realiza a conexao com o banco de dados e carrega nossos models
import Sequelize from "sequelize";
import databaseConfig from "../config/database";

const models = [];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // Conexao com o banco de dados
    this.connection = new Sequelize(databaseConfig);
    // Carrega os models
    models.map(model => model.init(this.connection));
    //.map(model => model.associate && model.associate(this.connection.models));
    // Soh vai executar o segundo map se o model tiver a funcao associate
  }
}

export default new Database();
