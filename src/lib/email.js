"use server";

import * as SibApiV3Sdk from "@sendinblue/client";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  BREVO_API_KEY
);
console.log("Client Brevo initialisé avec succès.");

export async function sendEmail({ to, subject, text, html }) {
  const emailData = {
    sender: {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL,
    },
    to: [{ email: to }],
    subject: subject || "Sans sujet",
    htmlContent:
      html ||
      `<html><body><p>${
        text || "Message vide"
      }</p><hr/><small>MedFlow 🚀</small></body></html>`,
    textContent: text || "",
  };

  console.log("🧾 Données email envoyées à Brevo :", emailData);

  try {
    const response = await apiInstance.sendTransacEmail(emailData);
    console.log(`📩 Email envoyé à ${to} avec succès !`);
    return { success: true, response };
  } catch (error) {
    console.error(
      "❌ Erreur lors de l’envoi :",
      error.response?.body || error.message
    );
    return { success: false, error: error.message };
  }
}
