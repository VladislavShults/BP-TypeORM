import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  async sendEmailRecoveryCode(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.gmail.com',
      auth: {
        user: process.env.userNodemailer,
        pass: process.env.passwordNodemailer,
      },
      secure: true,
    });

    await new Promise((resolve, reject) => {
      // verify connection configuration
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log('Server is ready to take our messages');
          resolve(success);
        }
      });
    });

    const mailData = {
      from: '"Vladislav" <shvs1510@gmail.com>',
      replyTo: email,
      to: email,
      subject: 'code',
      html:
        "<a href='https://some-front.com/confirm-registration?code=" +
        code +
        "'>code</a>",
    };

    await new Promise((resolve, reject) => {
      // send mail
      transporter.sendMail(mailData, (err, info) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(info);
          resolve(info);
        }
      });
    });

    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   host: 'smtp.gmail.com',
    //   auth: {
    //     user: process.env.userNodemailer,
    //     pass: process.env.passwordNodemailer,
    //   },
    // });
    //
    // const sendMessage = async () => {
    //   await transporter.sendMail({
    //     from: '"Vladislav" <shvs1510@gmail.com>',
    //     to: email,
    //     subject: 'code',
    //     html:
    //       "<a href='https://some-front.com/confirm-registration?code=" +
    //       code +
    //       "'>code</a>",
    //   });
    // };
    //
    // const s = await sendMessage();
    //
    // return s;
    // const info = transporter.sendMail({
    //   from: '"Vladislav" <shvs1510@gmail.com>',
    //   to: email,
    //   subject: 'code',
    //   html:
    //     "<a href='https://some-front.com/confirm-registration?code=" +
    //     code +
    //     "'>code</a>",
    // });
    //   sgMail.setApiKey(
    //     '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',
    //   );
    //   const msg = {
    //     to: email, // Change to your recipient
    //     from: 'shvs1510@gmail.com', // Change to your verified sender
    //     subject: 'code',
    //     html:
    //       "<a href='https://some-front.com/confirm-registration?code=" +
    //       code +
    //       "'>code</a>",
    //   };
    //   await sgMail
    //     .send(msg)
    //     .then(() => {
    //       console.log('Email sent');
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
    // }
  }
}
