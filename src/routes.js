import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import CourierController from './app/controllers/CourierController';
import FileController from './app/controllers/FileController';

const routes = new Router();
const upload = multer(multerConfig);
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
routes.get('/recipients/', RecipientController.index);

routes.post('/couriers/', CourierController.store);
routes.put('/couriers/', CourierController.update);
routes.get('/couriers/', CourierController.index);
routes.delete('/couriers/', CourierController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
