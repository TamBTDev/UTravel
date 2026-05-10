import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

const initializeTransporter = async () => {
  try {
    // Tạo Test Account (Ethereal - dùng để test)
    if (!process.env.SMTP_HOST) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("Using Test Email Account (Ethereal)");
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      console.log("Using Production Email Account");
    }
  } catch (error) {
    console.error("Email Service Initialization Error:", error);
    throw error;
  }
};

/**
 * Gửi Email
 */
export const send = async (options: EmailOptions) => {
  try {
    if (!transporter) {
      await initializeTransporter();
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"UTravel" <noreply@utravel.com>',
      ...options,
    };

    const info = await transporter!.sendMail(mailOptions);

    if (process.env.NODE_ENV !== "production") {
      console.log("Email preview URL:", nodemailer.getTestMessageUrl(info));
    }

    console.log(`Email sent to ${options.to}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Gửi Email OTP cho đăng ký
 */
export const sendRegisterOtp = async (
  email: string,
  otp: string,
  expiresIn: number = 10,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Xác thực Email UTravel</h2>
      <p>Chào bạn,</p>
      <p>Bạn đã yêu cầu đăng ký tài khoản trên UTravel. Vui lòng sử dụng mã OTP dưới đây để xác thực:</p>
      
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
        <h1 style="color: #2c3e50; margin: 0; letter-spacing: 2px;">${otp}</h1>
      </div>
      
      <p style="color: #666;">Mã OTP có hiệu lực trong <strong>${expiresIn} phút</strong>.</p>
      <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">© UTravel - Nền tảng đặt phòng trực tuyến</p>
    </div>
  `;

  return send({
    to: email,
    subject: "Mã xác thực UTravel (OTP)",
    html,
  });
};

/**
 * Gửi Email OTP cho quên mật khẩu
 */
export const sendResetPasswordOtp = async (
  email: string,
  otp: string,
  expiresIn: number = 10,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Đặt lại Mật khẩu UTravel</h2>
      <p>Chào bạn,</p>
      <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP dưới đây:</p>
      
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
        <h1 style="color: #2c3e50; margin: 0; letter-spacing: 2px;">${otp}</h1>
      </div>
      
      <p style="color: #666;">Mã OTP có hiệu lực trong <strong>${expiresIn} phút</strong>.</p>
      <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">© UTravel - Nền tảng đặt phòng trực tuyến</p>
    </div>
  `;

  return send({
    to: email,
    subject: "Mã đặt lại mật khẩu UTravel (OTP)",
    html,
  });
};

/**
 * Gửi Email Xác nhận Đăng ký Thành công
 */
export const sendRegistrationSuccess = async (
  email: string,
  userName: string,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">✓ Đăng ký Thành công!</h2>
      <p>Chào ${userName},</p>
      <p>Tài khoản của bạn đã được tạo và kích hoạt thành công!</p>
      
      <p>Bạn có thể bắt đầu sử dụng UTravel ngay bây giờ:</p>
      <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/login" 
         style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Đăng nhập ngay
      </a>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">© UTravel - Nền tảng đặt phòng trực tuyến</p>
    </div>
  `;

  return send({
    to: email,
    subject: "Đăng ký thành công trên UTravel",
    html,
  });
};
