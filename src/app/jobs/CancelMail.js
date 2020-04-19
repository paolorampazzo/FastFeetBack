import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancelMail {
  get key() {
    return 'CancelMail';
    // Pra cada job, precisa de uma chave unica
  }

  async handle({ data }) {
    const { delivery, problemIdExists } = data;
    const { createdAt: date, canceled_at } = delivery;

    const { email: couriermail, name: couriername } = delivery.courier;
    const {
      name: recipientname,
      rua,
      numero,
      cep,
      complemento,
      cidade,
      estado,
    } = delivery.recipient;
    const { description } = problemIdExists;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${couriername} <${couriermail}>`,
      subject: 'Entrega cancelada',
      template: 'newcancel',
      context: {
        couriername,
        couriermail,
        cidade,
        rua,
        cep,
        numero,
        estado,
        complemento,
        recipientname,
        description,
        canceled_at: format(
          parseISO(canceled_at),
          "'dia' dd 'de' MMMM', as' H:mm'h'",
          {
            locale: pt,
          }
        ),
        image:
          'https://github.com/Rocketseat/bootcamp-gostack-desafio-03/raw/master/.github/logo.png',
        date: format(parseISO(date), "'dia' dd 'de' MMMM', as' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new CancelMail();
