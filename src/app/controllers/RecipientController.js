import * as Yup from 'yup';
import Recipient from '../models/Recipient';

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

    const user = await Recipient.findByPk(req.body.id);

    if (!user) {
      res.status(400).json({ error: 'Usuario nao encontrado' });
    }

    const data = await user.update(req.body);

    return res.json(data);
  }

  // Nao havera async delete() {}, pois os usuarios devem
  // ser mantidos segundo as espeficicacoes

  async index(req, res) {
    const { page = 1 } = req.query;

    // As buscas serao feitas considerando o valor logico E, ou seja,
    // Devera matchar todas os campos de pesquisa
    // Podemos controlar no front quais requisicoes devem ser enviadas em caso de um novo cadastro

    const recipients = await Recipient.findAll({
      where: {
        ...req.body,
      },
      order: ['updated_at'],
      limit: 10,
      offset: (page - 1) * 10,
      attributes: ['id', 'name', 'rua', 'numero', 'cep', 'complemento'],
    });

    return res.json(recipients);
  }
}

export default new RecipientController();
