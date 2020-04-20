import Signature from '../models/Signature';

class SignatureController {
  async store(req, res) {
    const name = '123a12a11123121sdsss.jpg';
    const path = '21a2131232asssd.jpg';

    const file = await Signature.create({
      name,
      path,
    });
    return res.json(file);
  }
}

export default new SignatureController();
