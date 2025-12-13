import nodemailer from 'nodemailer';

const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;

if (!smtpEmail || !smtpPassword) {
  console.error('❌ SMTP Credentials missing in environment variables');
} else {
  console.log('✅ SMTP Credentials loaded:', {
    email: smtpEmail,
    passwordLength: smtpPassword.length,
  });
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your Velox Account</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #050505; color: #ededed; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 32px; font-weight: bold; color: #ededed; text-decoration: none; letter-spacing: -1px; }
        .logo-dot { color: #00FF94; }
        .card { background-color: #141414; border: 1px solid #333333; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5); }
        .title { font-size: 28px; font-weight: bold; margin-bottom: 24px; color: #ededed; }
        .text { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 32px; }
        .button { display: inline-block; background: linear-gradient(135deg, #00FF94 0%, #00E5FF 100%); color: #000000; font-weight: bold; text-decoration: none; padding: 16px 40px; border-radius: 12px; transition: opacity 0.3s ease; font-size: 16px; }
        .button:hover { opacity: 0.9; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #52525b; }
        .link { color: #00FF94; text-decoration: none; word-break: break-all; }
        .divider { border-top: 1px solid #333333; margin: 30px 0; }
        .social-links { margin-top: 20px; }
        .social-link { color: #52525b; text-decoration: none; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${process.env.NEXTAUTH_URL}" class="logo">Velox<span class="logo-dot">.</span></a>
        </div>
        <div class="card">
          <h1 class="title">Verify your email</h1>
          <p class="text">
            Welcome to the future of financial tracking. To secure your account and unlock full access to Velox, please verify your email address.
          </p>
          <a href="${verificationUrl}" class="button">Verify Account</a>
          
          <div class="divider"></div>
          
          <p class="text" style="margin-bottom: 10px; font-size: 14px;">
            Or copy this link to your browser:
          </p>
          <a href="${verificationUrl}" class="link">${verificationUrl}</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Velox Inc. All rights reserved.</p>
          <p>123 Innovation Dr, Tech City, TC 90210</p>
          <div class="social-links">
            <a href="#" class="social-link">Twitter</a> • 
            <a href="#" class="social-link">LinkedIn</a> • 
            <a href="#" class="social-link">Instagram</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Velox Security" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Verify your Velox Account',
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your Velox Password</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #050505; color: #ededed; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 32px; font-weight: bold; color: #ededed; text-decoration: none; letter-spacing: -1px; }
        .logo-dot { color: #00FF94; }
        .card { background-color: #141414; border: 1px solid #333333; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5); }
        .title { font-size: 28px; font-weight: bold; margin-bottom: 24px; color: #ededed; }
        .text { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 32px; }
        .button { display: inline-block; background: linear-gradient(135deg, #00FF94 0%, #00E5FF 100%); color: #000000; font-weight: bold; text-decoration: none; padding: 16px 40px; border-radius: 12px; transition: opacity 0.3s ease; font-size: 16px; }
        .button:hover { opacity: 0.9; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #52525b; }
        .link { color: #00FF94; text-decoration: none; word-break: break-all; }
        .divider { border-top: 1px solid #333333; margin: 30px 0; }
        .social-links { margin-top: 20px; }
        .social-link { color: #52525b; text-decoration: none; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${process.env.NEXTAUTH_URL}" class="logo">Velox<span class="logo-dot">.</span></a>
        </div>
        <div class="card">
          <h1 class="title">Reset your password</h1>
          <p class="text">
            We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
          </p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <div class="divider"></div>
          
          <p class="text" style="margin-bottom: 10px; font-size: 14px;">
            Or copy this link to your browser:
          </p>
          <a href="${resetUrl}" class="link">${resetUrl}</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Velox Inc. All rights reserved.</p>
          <p>123 Innovation Dr, Tech City, TC 90210</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Velox Security" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Reset your Velox Password',
    html,
  });
};
