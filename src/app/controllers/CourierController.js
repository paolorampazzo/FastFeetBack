import * as Yup from 'yup';
import { Op } from 'sequelize';
import Courier from '../models/Courier';

class CourierController {
  async store(req, res) {
    // Validacao de schema
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      isactive: Yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const courierExists = await Courier.findOne({
      where: { email: req.body.email },
    });
    if (courierExists) {
      return res
        .status(400)
        .json({ error: 'Entregador ja cadastrado com este e-mail.' });
    }

    const data = await Courier.create(req.body);
    return res.json(data);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      oldEmail: Yup.string()
        .email()
        .required(),
      email: Yup.string().email(),
      isactive: Yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { oldEmail, email } = req.body;

    const user = await Courier.findOne({ where: { email: oldEmail } });

    if (!user) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    if (email) {
      const userExists = await Courier.findOne({
        where: { email },
      });
      // Testa se o email que ele quer mudar nao ja esta cadastrado por outra pessoa
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    const data = await user.update(req.body);

    return res.json(data);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const { name, isactive = true } = req.body;

    // Fazer chamada api no front-end toda vez que alterar o estado do que esta sendo preenchido

    const myWhere = name
      ? {
          name: {
            [Op.iLike]: `%${name}%`,
          },
          isactive,
        }
      : {};

    const recipients = await Courier.findAll({
      where: myWhere,
      order: [['updated_at', 'DESC']],
      limit: 5,
      offset: (page - 1) * 5,
      attributes: ['id', 'name', 'email', 'isactive'],
    });

    return res.json(recipients);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      confirmEmail: Yup.string()
        .email()
        .when('email', (email, field) =>
          email ? field.required().oneOf([Yup.ref('email')]) : field
        ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const user = await Courier.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario nao encontrado' });
    }

    user.isactive = false;

    const data = await user.save();

    return res.json(data);
  }
}
export default new CourierController();
