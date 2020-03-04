import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

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
routes.post('/recipients', RecipientController.store);

export default routes;
