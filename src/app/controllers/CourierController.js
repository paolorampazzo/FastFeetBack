import * as Yup from 'yup';
import { Op } from 'sequelize';
import Courier from '../models/Courier';
import File from '../models/File';
import Handout from '../models/Handout';

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
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const courier = await Courier.findByPk(id);

    if (!courier) {
      return res.status(400).json({ error: 'Courier does not exist' });
    }

    const data = await courier.update(req.body);

    return res.json(data);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const { id } = req.params;

    if (id) {
      const checkMobile = await Courier.findByPk(id, {
        include: [
          {
            model: File,
            as: 'avatar',
          },
        ],
      });

      if (!checkMobile) {
        return res.status(400).json({ error: 'O usuario nao existe' });
      }

      return res.status(200).json(checkMobile);
    }
    const maxItems = 5;

    const { isactive = true } = req.body;

    const { name, email, all = false } = req.query;

    // Fazer chamada api no front-end toda vez que alterar o estado do que esta sendo preenchido

    let myWhere = name
      ? {
          name: {
            [Op.iLike]: `%${name}%`,
          },
          isactive,
        }
      : {};

    myWhere = email ? { ...myWhere, email } : myWhere;

    const show = !all ? maxItems : null;
    const offset = !all ? (page - 1) * maxItems : 0;

    const recipients = await Courier.findAll({
      where: myWhere,
      order: [['updated_at', 'DESC']],
      limit: show,
      offset,
      attributes: ['id', 'name', 'email', 'isactive'],
      include: [
        {
          model: File,
          as: 'avatar',
        },
      ],
    });

    return res.json(recipients);
  }

  async delete(req, res) {
    const { id } = req.params;

    const courierExists = await Courier.findByPk(id);

    if (!courierExists) {
      return res.status(400).json({ error: 'The id does not exist' });
    }

    const checkHandouts = await Handout.findOne({
      where: {
        deliveryman_id: courierExists.id,
      },
    });

    if (checkHandouts) {
      return res.status(401).json({ error: 'Nao eh possivel deletar' });
    }

    // VERIFICACAO POIS O SEQUELIZE EH ALLOWNULL FALSE NO HANDOUT CONTROLLER, COM ISSO, NAO DEIXA DELETAR E NEM JOGA ERRO

    const courierDelete = await Courier.destroy({
      where: { id },
    });

    return res.json(courierDelete);
  }
}
export default new CourierController();
