import sgMail, { MailDataRequired } from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
  console.error("env variable SENDGRID_API_KEY is not defined");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendOneEmail(email: MailDataRequired) {
  if (!email.from) {
    email.from = "hello@toptierperk.com";
  }
  try {
    await sgMail.send(email);
    return;
  } catch (err) {
    console.error("Failed to send email ", email);
    return;
  }
}
