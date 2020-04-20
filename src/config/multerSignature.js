import multer from 'multer';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'signatures'),
    filename: (req, file, cb) =>
      cb(null, file.originalname + extname(file.originalname)),
  }),
};
