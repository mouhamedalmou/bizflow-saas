const nodemailer = require("nodemailer");
const ApiError = require("./apiError");

const sendEmail = async ({ to, subject, html }) => {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new ApiError(500, "Email service is not configured");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"BizFlow SaaS" <${user}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
