import * as Yup from 'yup';
import { parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';
import Handout from '../models/Handout';

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
    const { cidade, name: recipientname } = recipientExists;

    const newdeliver = {
      couriermail,
      couriername,
      cidade,
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
      start_date: Yup.date(),
      end_date: Yup.date(),
      canceled_at: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const handout = await Handout.findByPk(id);

    if (!handout) {
      return res.status(400).json({ error: 'The handout id does not exist' });
    }

    const {
      recipient_id,
      deliveryman_id,
      start_date,
      end_date,
      canceled_at,
    } = req.body;
    // Testar se os valores batem

    if (recipient_id !== handout.recipient_id) {
      return res.status(400).json({ error: 'The recipient id does not match' });
    }

    if (deliveryman_id !== handout.deliveryman_id) {
      return res
        .status(400)
        .json({ error: 'The deliveryman id does not match' });
    }

    // Check start_date

    if (start_date && isBefore(parseISO(start_date), new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot have a start date before now' });
    }

    // Check end_date

    if (end_date && isBefore(parseISO(end_date), new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot have an end date before now' });
    }

    // Check canceled_at

    if (canceled_at && isBefore(parseISO(canceled_at), handout.start_date)) {
      return res
        .status(400)
        .json({ error: 'You cannot have a start date before the start date' });
    }

    // Do not let change the start_date

    if (handout.start_date && start_date) {
      return res
        .status(400)
        .json({ error: 'You cannot change the start date' });
    }

    // Do not let change the canceled date

    if (handout.canceled_at && canceled_at) {
      const formattedDate = format(
        parseISO(canceled_at),
        "'dia' dd 'de' MMMM', as' H:mm'h'",
        { locale: pt }
      );

      return res
        .status(400)
        .json({ error: `The item was already canceled on ${formattedDate}` });
    }
    await handout.update(req.body);

    const updatedHandout = await Handout.findByPk(id);

    return res.json(updatedHandout);
  }

  async index(req, res) {
    // Listar item especifico

    const { page = 1, id } = req.query;

    // Primeiramente, se for solicitado um id especifico, nem conferimos os deliveryman_id e recipient_id
    // pois quem esta fazendo a requisicao nao precisa conferir se bate (somente no update)
    if (id) {
      const handout = await Handout.findByPk(id, {
        order: [['start_date', 'DESC']],
        limit: 10,
        offset: (page - 1) * 10,
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
      if (!handout) {
        return res.status(400).json({ error: 'The deliver id does not exist' });
      }

      return res.json(handout);
    }

    // Caso contrario vamos verificar por deliveryman_id ou recipient_id, ou ambos

    const { deliveryman_id, recipient_id } = req.query;

    let myWhere = deliveryman_id ? { deliveryman_id } : {};
    myWhere = recipient_id ? { ...myWhere, recipient_id } : myWhere;

    const checkHandout = await Handout.findAll({
      where: myWhere,
      order: [['start_date', 'DESC']],
      limit: 10,
      offset: (page - 1) * 10,
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
}
export default new HandoutController();
