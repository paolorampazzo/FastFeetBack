import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

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
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.put('/users', UserController.update);

export default routes;
