import { Router } from 'express';
import multer from 'multer';
import multerConfigProfile from './config/multerUser';
import multerConfigSignature from './config/multerSignature';

import authMiddleware from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import CourierController from './app/controllers/CourierController';
import FileController from './app/controllers/FileController';
import SignatureController from './app/controllers/SignatureController';
import HandoutController from './app/controllers/HandoutController';

const routes = new Router();
const uploadphoto = multer(multerConfigProfile);
const uploadsignature = multer(multerConfigSignature);

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

routes.post('/files', uploadphoto.single('file'), FileController.store);

routes.post(
  '/signatures',
  uploadsignature.single('file'),
  SignatureController.store
);

routes.post('/handouts', HandoutController.store);
routes.put('/handouts/:id', HandoutController.update);
routes.get('/handouts/', HandoutController.index);

export default routes;
