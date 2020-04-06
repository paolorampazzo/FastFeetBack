import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'signatures'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        // Garantir que cada imagem tem nome unico
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }), // Aqui seria onde vao ser guardadas as informacoes da imagem, tipo o amazon s3
};
