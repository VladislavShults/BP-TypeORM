import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  sendEmailRecoveryCode(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: process.env.userNodemailer,
        pass: process.env.passwordNodemailer,
      },
    });

    const sendMessage = async () => {
      await transporter.sendMail({
        from: '"Vladislav" <shvs1510@gmail.com>',
        to: email,
        subject: 'code',
        html:
          "<a href='https://some-front.com/confirm-registration?code=" +
          code +
          "'>code</a>",
      });
    };

    sendMessage();
    // const info = transporter.sendMail({
    //   from: '"Vladislav" <shvs1510@gmail.com>',
    //   to: email,
    //   subject: 'code',
    //   html:
    //     "<a href='https://some-front.com/confirm-registration?code=" +
    //     code +
    //     "'>code</a>",
    // });
  }
}
