const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  }
});

const sendVerificationEmail = async (to, link) => {
  const mailOptions = {
    from: `"Shop" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Xác thực tài khoản',
    html: `
      <p>Chào bạn, vui lòng xác thực tài khoản bằng cách nhấn vào liên kết sau:</p>
      <a href="${link}">${link}</a>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
