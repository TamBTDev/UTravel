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

/**
 * Gửi Email Thông báo Đặt phòng thành công (Realtime Event)
 */
export const sendBookingNotification = async (
  email: string,
  userName: string,
  bookingDetails: {
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    bookingId: number;
  },
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0b63d6; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Đặt Phòng Thành Công</h2>
      </div>
      <div style="padding: 20px;">
        <p>Chào <strong>${userName}</strong>,</p>
        <p>Cảm ơn bạn đã đặt phòng tại UTravel. Đơn đặt phòng <strong>#UT-${bookingDetails.bookingId}</strong> của bạn đã được ghi nhận thành công.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111827;">Chi tiết Đặt phòng</h3>
          <p style="margin: 5px 0;"><strong>Khách sạn:</strong> ${bookingDetails.hotelName}</p>
          <p style="margin: 5px 0;"><strong>Hạng phòng:</strong> ${bookingDetails.roomType}</p>
          <p style="margin: 5px 0;"><strong>Nhận phòng:</strong> ${bookingDetails.checkIn}</p>
          <p style="margin: 5px 0;"><strong>Trả phòng:</strong> ${bookingDetails.checkOut}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
          <p style="margin: 5px 0; font-size: 16px; color: #0b63d6;"><strong>Tổng tiền:</strong> ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(bookingDetails.totalPrice)}</p>
        </div>
        
        <p>Vui lòng theo dõi trạng thái đơn hàng trong mục Lịch sử đặt phòng.</p>
        <p>Chúc bạn có một kỳ nghỉ thật tuyệt vời!</p>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
        © UTravel - Nền tảng đặt phòng trực tuyến
      </div>
    </div>
  `;

  return send({
    to: email,
    subject: `Xác nhận đặt phòng #${bookingDetails.bookingId} tại ${bookingDetails.hotelName}`,
    html,
  });
};

/**
 * Gửi Email Thông báo có Đánh giá mới (Realtime Event)
 */
export const sendReviewNotification = async (
  vendorEmail: string,
  hotelName: string,
  reviewerName: string,
  rating: number,
  comment: string,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Đánh Giá Mới</h2>
      </div>
      <div style="padding: 20px;">
        <p>Chào Đối tác,</p>
        <p>Khách sạn <strong>${hotelName}</strong> của bạn vừa nhận được một đánh giá mới từ khách hàng <strong>${reviewerName}</strong>.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0; font-size: 18px; color: #f59e0b;"><strong>${rating} Sao</strong></p>
          <p style="margin: 10px 0 5px; color: #374151;">"${comment || "Khách hàng không để lại bình luận"}"</p>
        </div>
        
        <p>Hãy truy cập vào Dashboard Đối tác để xem và phản hồi khách hàng nhé!</p>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
        © UTravel - Nền tảng đặt phòng trực tuyến
      </div>
    </div>
  `;

  return send({
    to: vendorEmail,
    subject: `[UTravel] Khách sạn ${hotelName} nhận được đánh giá ${rating} sao`,
    html,
  });
};
