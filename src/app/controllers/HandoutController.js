import * as Yup from 'yup';
import { Op } from 'sequelize';
import qs from 'qs';
import { parseISO, isBefore, format, isToday } from 'date-fns';

import pt from 'date-fns/locale/pt';
import Courier from '../models/Courier';
import File from '../models/File';
import Recipient from '../models/Recipient';
import Handout from '../models/Handout';
import Signature from '../models/Signature';

// import Mail from '../../lib/Mail'; // Testar o email sem criar template
import Queue from '../../lib/Queue';
import NewdeliverMail from '../jobs/NewdeliverMail';

class HandoutController {
  async store(req, res) {
    // Validacao de schema
    const schema = Yup.object().shape({
      recipient_id: Yup.number()
        .integer()
        .required(),
      deliveryman_id: Yup.number()
        .integer()
        .required(),
      product: Yup.string(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Buscar se recipient_id existe

    const recipientExists = await Recipient.findByPk(req.body.recipient_id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'The recipient id does not exist' });
    }

    // Buscar se deliveryman_id existe

    const deliverymanExists = await Courier.findByPk(req.body.deliveryman_id);

    if (!deliverymanExists) {
      return res
        .status(400)
        .json({ error: 'The deliveryman id does not exist' });
    }

    if (
      req.body.start_date &&
      isBefore(parseISO(req.body.start_date), new Date())
    ) {
      return res
        .status(400)
        .json({ error: 'You cannot have a start date before now' });
    }

    const data = await Handout.create(req.body);

    // // Testar email antes de configurar o template e a fila
    const { email: couriermail, name: couriername } = deliverymanExists;
    const {
      cidade,
      name: recipientname,
      rua,
      estado,
      numero,
      complemento,
      cep,
    } = recipientExists;

    const newdeliver = {
      couriermail,
      couriername,
      cidade,
      rua,
      numero,
      complemento,
      estado,
      cep,
      date: data.createdAt,
      recipientname,
      image:
        'https://github.com/Rocketseat/bootcamp-gostack-desafio-03/raw/master/.github/logo.png',
    };

    await Queue.add(NewdeliverMail.key, {
      newdeliver,
    });
    // await Mail.sendMail({
    //   to: `${deliveryname} <${deliverymail}>`,
    //   subject: 'Teste',
    //   // text: 'Este eh um teste',
    //   // Agora podemos adicionar o template e as variaveis
    //   template: 'newdeliver',
    //   context: {
    //     barber: deliveryname,
    //     recipient: recipientname,
    //     cidade,
    //     date: data.createdAt,
    //     image:
    //       'https://github.com/Rocketseat/bootcamp-gostack-desafio-03/raw/master/.github/logo.png',
    //   },
    // });
    return res.json(data);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number()
        .integer()
        .required(),
      deliveryman_id: Yup.number()
        .integer()
        .required(),
      signature_id: Yup.number().integer(),
      product: Yup.string(),
      end_date: Yup.date(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const handout = await Handout.findByPk(id);

    if (!handout) {
      return res.status(400).json({ error: 'The handout id does not exist' });
    }

    const { recipient_id, deliveryman_id, edit = false } = req.body;

    if (edit) {
      if (req.body.recipient_id) {
        const newRecipientExists = await Recipient.findByPk(
          req.body.recipient_id
        );

        if (!newRecipientExists) {
          console.log('testee');
          return res
            .status(400)
            .json({ error: 'The recipient id does not exist' });
        }
      }

      if (req.body.deliveryman_id) {
        const newCourierExists = await Courier.findByPk(
          req.body.deliveryman_id
        );

        if (!newCourierExists) {
          return res
            .status(400)
            .json({ error: 'The courier id does not exist' });
        }
      }

      const editted = await handout.update(req.body);
      return res.json(editted);
    }
    // Testar se os valores batem

    if (recipient_id !== handout.recipient_id) {
      return res.status(400).json({ error: 'The recipient id does not match' });
    }

    if (deliveryman_id !== handout.deliveryman_id) {
      return res
        .status(400)
        .json({ error: 'The deliveryman id does not match' });
    }

    // Check number of start in the day
    const maxPerDay = 1;
    const draws = await Handout.findAll({
      where: {
        deliveryman_id,
      },
    });

    const drawsToday = draws.filter(item => isToday(item.start_date));

    if (drawsToday.length >= maxPerDay) {
      return res.status(400).json({
        error: `You have already achieved the limit of ${maxPerDay} draws for today`,
      });
    }

    // Check start_date

    if (
      !handout.start_date &&
      (new Date().getUTCHours() < 11 ||
        new Date().getUTCHours() >= 22 ||
        (new Date().getUTCHours() === 21 && new Date().getUTCMinutes() !== 0))
    ) {
      return res
        .status(400)
        .json({ error: 'Voce so pode iniciar uma entrega entre 8 e 18 hrs' });
    }

    if (!handout.start_date) {
      await handout.update({
        start_date: new Date().toUTCString(),
      });
      return res.status(200).json({});
    }

    if (!handout.end_date) {
      if (!req.body.signature_id) {
        return res
          .status(400)
          .json({ error: 'You have not provided a signature id' });
      }

      const signatureExists = await Signature.findByPk(req.body.signature_id);
      if (!signatureExists) {
        return res.status(400).json({ error: 'This signature does not exist' });
      }

      if (handout.canceled_at) {
        return res
          .status(400)
          .json({ error: 'This item has been canceled already' });
      }
      await handout.update({
        end_date: new Date().toUTCString(),
        signature_id: req.body.signature_id,
      });
      return res.status(200).json({});
    }

    return res.status(400).json({});
  }

  async index(req, res) {
    // Listar item especifico

    const { page = 1 } = req.query;

    const { id } = req.params;

    const maxItems = 5;

    // Primeiramente, se for solicitado um id especifico, nem conferimos os deliveryman_id e recipient_id
    // pois quem esta fazendo a requisicao nao precisa conferir se bate (somente no update)
    if (id) {
      const handout = await Handout.findByPk(id, {
        order: [['createdAt', 'DESC']],

        attributes: [
          'id',
          'start_date',
          'end_date',
          'canceled_at',
          'product',
          'signature_id',
          'deliveryman_id',
          'recipient_id',
        ],
        include: [
          {
            model: Courier,
            as: 'courier',
            attributes: ['id', 'name', 'email', 'isactive'],
            include: {
              model: File,
              as: 'avatar',
            },
          },
          {
            model: Recipient,
            as: 'recipient',
            attributes: [
              'id',
              'name',
              'rua',
              'numero',
              'estado',
              'complemento',
              'cidade',
              'cep',
            ],
          },
          {
            model: Signature,
            as: 'signature',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });
      if (!handout) {
        return res.status(400).json({ error: 'The deliver id does not exist' });
      }

      return res.json(handout);
    }

    // Caso contrario vamos verificar por deliveryman_id ou recipient_id, ou ambos

    const {
      deliveryman_id,
      recipient_id,
      canceled = false,
      finished = false,
      all = false,
      produto,
    } = req.query;

    let myWhere = produto
      ? {
          product: {
            [Op.iLike]: `%${produto}%`,
          },
        }
      : {};

    const problemIds = req.query.problemIds
      ? JSON.parse(req.query.problemIds)
      : [];

    myWhere =
      problemIds.length === 0
        ? myWhere
        : {
            ...myWhere,
            id: {
              [Op.in]: problemIds,
            },
          };

    const show = !all ? maxItems : null;
    const offset = !all ? (page - 1) * maxItems : 0;

    if (deliveryman_id) {
      const myhandouts = await Handout.findAll({
        where: {
          deliveryman_id,
          canceled_at: null,
        },
        limit: null,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Recipient,
            as: 'recipient',
          },
        ],
      });

      return res.json(myhandouts);
    }

    const checkHandout = await Handout.findAll({
      where: myWhere,
      order: [['createdAt', 'DESC']],
      limit: show,
      offset,
      attributes: [
        'id',
        'start_date',
        'end_date',
        'canceled_at',
        'product',
        'signature_id',
        'deliveryman_id',
        'recipient_id',
      ],
      include: [
        {
          model: Courier,
          as: 'courier',
          attributes: ['id', 'name', 'email', 'isactive'],
          include: {
            model: File,
            as: 'avatar',
          },
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'rua',
            'numero',
            'estado',
            'complemento',
            'cidade',
            'cep',
          ],
        },
      ],
    });

    return res.json(checkHandout);
  }

  async delete(req, res) {
    const { id } = req.params;

    const idExists = await Handout.findByPk(id);

    if (!idExists) {
      return res.status(400).json({ error: 'The id does not exist' });
    }

    const handoutDelete = await Handout.destroy({
      where: { id },
    });

    return res.json(handoutDelete);
  }
}
export default new HandoutController();
