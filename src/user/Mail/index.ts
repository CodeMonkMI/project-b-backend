import sendMail from "../../mail/mail";
import { newUserForAdminsTemplate } from "./Templates/newUserForAdmins.html";
import { newUserVerifiedTemplate } from "./Templates/newUserVerified.html";
import { newUserWithPasswordTemplate } from "./Templates/newUserWithPassword.html";

const { SITE_URL_FOR_MAIL = "" } = process.env;
// mail sending to newly created user
export const sendMailToNewUser = async (
  receiver: string,
  password: string,
  fullName: string
) => {
  const html = newUserWithPasswordTemplate({
    generatedPassword: password,
    siteUrl: SITE_URL_FOR_MAIL,
    fullName,
  });
  await sendMail({
    receiver,
    subject: "You account is being created",
    text: "Your next great experience is just a login away",
    html,
  });
};
export const sendMailToAdminsForNewUser = async (receivers: string[]) => {
  const html = newUserForAdminsTemplate({
    url: SITE_URL_FOR_MAIL + `/users/pending`,
  });
  await sendMail({
    receiver: receivers,
    subject: "An account is being created. Need to verify!",
    text: "Login and verify the account now",
    html,
  });
};
export const sendMailToVerifiedUser = async (receiver: string) => {
  const html = newUserVerifiedTemplate({
    url: SITE_URL_FOR_MAIL,
  });
  await sendMail({
    receiver,
    subject: "Your account is verified!",
    text: "Your next great experience is just a login away",
    html,
  });
};
