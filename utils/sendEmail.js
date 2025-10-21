import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // بريد الإرسال
      pass: process.env.EMAIL_PASS, // كلمة السر أو App Password
    },
  });

  const mailOptions = {
    from: `"MikroLink" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
