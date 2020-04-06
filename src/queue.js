import Queue from './lib/Queue';

Queue.processQueue();

// Este arquivo existe para que seja executado em outro node, para rodar
// a fila em um servidor totalmente separado da aplicacao, para que ela nao
// influencie no restante da aplicacao

// nao esquecer de adicionar um script no package pra rodar o sucrase
