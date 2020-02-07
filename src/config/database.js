// Tambem tem que ser no estilo antigo
//require('dotenv/config')
module.exports = {
  dialect: "postgres",
  host: "localhost",
  username: "postgres",
  password: "desafio",
  database: "desafio",
  define: {
    timestamps: true, // Padronizacao de preenchimento de coluna created at e updated at em cada coluna do banco de dados.
    underscored: true,
    underscoredAll: true
  }
};
