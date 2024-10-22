import nodemailer from "nodemailer";

interface SendMailProps {
  receiver: string | string[];
  subject: string;
  text: string;
  html: string;
}

const sendMail = async (props: SendMailProps) => {
  const { html, receiver, subject, text } = props;
  try {
    const { MAIL_HOST_NAME, MAIL_PORT, USER_MAIL_NAME, USER_MAIL_PASSWORD } =
      process.env;

    const config: any = {
      host: MAIL_HOST_NAME,
      port: MAIL_PORT,
      auth: {
        user: USER_MAIL_NAME,
        pass: USER_MAIL_PASSWORD,
      },
    };

    var transport = nodemailer.createTransport(config);

    let info = await transport.sendMail({
      from: USER_MAIL_NAME,
      to: receiver,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    throw new Error("Internal server");
  }
};

export default sendMail;
