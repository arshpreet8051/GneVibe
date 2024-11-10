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
    subject: "Welcome to GneVibe - Verify Your Email",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 40px 20px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dytwppboi/image/upload/v1731242871/trzo9pvzdmyobwampu8z.jpg" 
                 alt="GneVibe Logo" 
                 style="max-width: 150px; height: auto;">
          </div>
          
          <!-- Platform Name -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; color: #3b82f6; font-weight: bold;">GneVibe</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #6b7280;">Campus Connect</p>
          </div>
          
          <!-- Content -->
          <div style="text-align: center; color: #374151;">
            <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #1f2937;">Verify Your Email Address</h2>
            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #6b7280;">
              Welcome to GneVibe - Your Campus Connection Platform! 
              Please verify your email address to get started and join your campus community.
            </p>
            
            <!-- Button -->
            <a href="${verificationUrl}" 
               style="display: inline-block; 
                      background-color: #3b82f6; 
                      color: white; 
                      padding: 14px 32px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: bold;
                      margin: 20px 0;
                      transition: background-color 0.3s ease;">
              Verify Email Address
            </a>
            
            <!-- Additional Info -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                With GneVibe, you'll be able to:
              </p>
              <ul style="list-style: none; padding: 0; margin: 15px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                <li style="margin-bottom: 8px;">✨ Connect with campus peers</li>
                <li style="margin-bottom: 8px;">📚 Access academic resources</li>
                <li style="margin-bottom: 8px;">🎯 Stay updated with campus events</li>
                <li style="margin-bottom: 8px;">🤝 Join student communities</li>
              </ul>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                If you didn't create a GneVibe account, you can safely ignore this email.
              </p>
              <p style="margin-top: 10px; font-size: 14px; color: #9ca3af;">
                If the button doesn't work, copy and paste this link:
                <br>
                <a href="${verificationUrl}" style="color: #3b82f6; text-decoration: none; word-break: break-all;">
                  ${verificationUrl}
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <!-- Email Footer -->
        <div style="text-align: center; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            © ${new Date().getFullYear()} GneVibe - Campus Connect. All rights reserved.
          </p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">
            Made with ❤️ for college students
          </p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
