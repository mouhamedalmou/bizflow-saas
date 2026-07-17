import nodemailer from "nodemailer";
import ApiError from "./apiError";
interface EmailOptions { to: string; subject: string; html: string }
export default async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> { const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = process.env; if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) throw new ApiError(500, "Email service is not configured"); const transporter = nodemailer.createTransport({ host: EMAIL_HOST, port: Number(process.env.EMAIL_PORT) || 587, secure: Number(process.env.EMAIL_PORT) === 465, auth: { user: EMAIL_USER, pass: EMAIL_PASS } }); await transporter.sendMail({ from: process.env.EMAIL_FROM ?? EMAIL_USER, to, subject, html }); }
