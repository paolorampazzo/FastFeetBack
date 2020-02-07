import { Router } from 'express';

import UserController from './app/controllers/UserController';

const routes = new Router();
// Rota de Teste
// routes.get('/', async (req, res) => {
//   const user = await User.create({
//     name: 'Paolo Rampazzo',
//     email: 'paolorampazzo@gmail.com',
//     password_hash: 'asdasdas',
//   });

//   return res.json(user);
// });

routes.post('/users', UserController.store);

export default routes;
