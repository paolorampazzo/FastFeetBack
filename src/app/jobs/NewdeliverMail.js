import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class NewdeliverMail {
  get key() {
    return 'NewdeliverMail';
    // Pra cada job, precisa de uma chave unica
  }

  async handle({ data }) {
    const { newdeliver } = data;
    const {
      couriermail,
      couriername,
      cidade,
      rua,
      numero,
      complemento,
      estado,
      cep,
      date,
      recipientname,
      image,
    } = newdeliver;
    console.log('A fila executou');

    await Mail.sendMail({
      to: `${couriername} <${couriermail}>`,
      subject: 'Novo agendamento',
      template: 'newdeliver',
      context: {
        image,
        couriername,
        couriermail,
        cidade,
        rua,
        cep,
        numero,
        estado,
        complemento,
        recipientname,
        date: format(parseISO(date), "'dia' dd 'de' MMMM', as' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new NewdeliverMail();
