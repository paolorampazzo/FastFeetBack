import * as Yup from 'yup';
import Handout from '../models/Handout';
import Problem from '../models/Problem';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';

import Queue from '../../lib/Queue';
import CancelMail from '../jobs/CancelMail';

class ProblemController {
  async store(req, res) {
    // Validacao de schema
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const handoutExists = await Handout.findByPk(req.params.id);

    if (!handoutExists) {
      return res.status(400).json({ error: 'A entrega nao existe' });
    }

    const data = await Problem.create({
      delivery_id: req.params.id,
      description: req.body.description,
    });

    return res.status(200).json(data);
  }

  async index(req, res) {
    const { id } = req.params;
    const maxItems = 5;
    const { page = 1, all = false } = req.query;

    const show = !all ? maxItems : null;
    const offset = !all ? (page - 1) * maxItems : 0;

    if (!id) {
      const problems = await Problem.findAll({
        order: [['createdAt', 'DESC']],
        limit: show,
        offset,
      });

      return res.json(problems);
    }

    const problemsId = await Problem.findAll({
      where: {
        delivery_id: id,
      },
      order: [['createdAt', 'DESC']],
      limit: show,
      offset,
    });

    return res.json(problemsId);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryIdExists = await Handout.findByPk(id);

    if (!deliveryIdExists) {
      return res.status(400).json({ error: 'The delivery id does not exist' });
    }

    const delivery = await Handout.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Courier,
          as: 'courier',
        },
        {
          model: Recipient,
          as: 'recipient',
        },
      ],
    });

    if (delivery.canceled_at) {
      return res
        .status(400)
        .json({ error: 'A entrega ja se encontra cancelada' });
    }

    delivery.canceled_at = new Date().toISOString();

    await delivery.save();

    await Queue.add(CancelMail.key, { delivery, id });

    return res.json(delivery);
  }
}
export default new ProblemController();
