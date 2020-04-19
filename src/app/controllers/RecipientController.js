import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';
import Handout from '../models/Handout';

class RecipientController {
  async store(req, res) {
    // Validacao de schema
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      rua: Yup.string().required(),
      numero: Yup.number().required(),
      complemento: Yup.string(),
      estado: Yup.string().required(),
      cidade: Yup.string().required(),
      cep: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Nao vamos comparar os enderecos aqui, vamos deixar para o front end
    // Ser responsavel por chamar o index antes do store e garantir que nao ha
    // nenhum endereco parecido

    const data = await Recipient.create(req.body);
    return res.json(data);
  }

  async update(req, res) {
    // Validacao de schema
    const schema = Yup.object().shape({
      id: Yup.number(),
      name: Yup.string(),
      rua: Yup.string(),
      numero: Yup.number(),
      complemento: Yup.string(),
      estado: Yup.string(),
      cidade: Yup.string(),
      cep: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro de Validacao' });
    }

    const { id } = req.params;

    const user = await Recipient.findByPk(id);

    if (!user) {
      res.status(400).json({ error: 'Usuario nao encontrado' });
    }

    const data = await user.update(req.body);

    return res.json(data);
  }

  // Nao havera async delete() {}, pois os usuarios devem
  // ser mantidos segundo as espeficicacoes

  async index(req, res) {
    const { page = 1, name, all = false } = req.query;
    const maxItems = 5;

    const { id } = req.params;

    if (id) {
      const checkRecipient = await Recipient.findByPk(id);

      if (!checkRecipient) {
        return res.status(400).json({ error: 'O usuario nao existe' });
      }

      return res.status(200).json(checkRecipient);
    }

    // As buscas serao feitas considerando o valor logico E, ou seja,
    // Devera matchar todas os campos de pesquisa
    // Podemos controlar no front quais requisicoes devem ser enviadas em caso de um novo cadastro

    const myWhere = name
      ? {
          name: {
            [Op.iLike]: `%${name}%`,
          },
        }
      : {};

    const show = !all ? maxItems : null;
    const offset = !all ? (page - 1) * maxItems : 0;

    const recipients = await Recipient.findAll({
      where: myWhere,
      order: [['createdAt', 'DESC']],
      limit: show,
      offset,
      attributes: [
        'id',
        'name',
        'rua',
        'cidade',
        'numero',
        'cep',
        'complemento',
        'estado',
      ],
    });

    return res.json(recipients);
  }

  async delete(req, res) {
    const { id } = req.params;

    const recipientExists = await Recipient.findByPk(id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'The id does not exist' });
    }

    const checkHandouts = await Handout.findOne({
      where: {
        recipient_id: recipientExists.id,
      },
    });

    if (checkHandouts) {
      return res.status(401).json({ error: 'Nao eh possivel deletar' });
    }

    const recipientDelete = await Recipient.destroy({
      where: { id },
    });

    return res.json(recipientDelete);
  }
}

export default new RecipientController();
