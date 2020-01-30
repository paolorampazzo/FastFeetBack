import app from './app';

app.listen(3333);

// Com as alteracoes de import e export para o es6, utilizamos uma ferramenta, por exemplo o Babel
// Vamos utilizar sucrase. Para garantir entao que o programa rode sem erros,
// Vamos trocar por yarn sucrase-node src/server.js

// Pra funcionar tambem com nodemon, a gente cria o arquivo nodemon.json
// La dentro, a sintaxe significa que toda vez que rodar um js, ele ira executar antes o register que ta
// na pasta sucrase
