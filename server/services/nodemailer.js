import { BACKEND_DOMAIN, EMAIL_PASS, EMAIL_USER } from "../config/index.js";
import nodemailer from "nodemailer";

const sendVerificationEmail = async (user, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: `${EMAIL_USER}`,
      pass: `${EMAIL_PASS}`,
    },
  });

  const verificationUrl = `${BACKEND_DOMAIN}/user/verify-email?token=${token}`;

  const mailOptions = {
    from: `${EMAIL_USER}`,
    to: user.email,
    subject: "Email Verification",
    html: `
    <html>
    <head>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
    <h1 style="font-size: 1.125rem; text-align: center; margin-bottom: 0.5rem; color: #333;">Please Click on the following button to Confirm Email.</h1>
        <div style="text-align: center; margin-top: 1rem;">
            <a href="${verificationUrl}" style="text-decoration: none; cursor: pointer">
                <button style="
                    margin-top: 1rem;
                    padding: 0.5rem 1.5rem;
                    font-size: 1rem;
                    border-radius: 0.375rem;
                    background-color: #3b82f6;
                    color: #ffffff;
                    border: none;
                    cursor: pointer;
                    text-align: center;
                    display: inline-block;
                    text-decoration: none;
                    
                ">
                    Click To Confirm
                </button>
            </a>
        </div>
     </body>
     </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
