import * as userRepository from "@/repositories/user.repository";
import * as userOtpRepository from "@/repositories/userOtp.repository";
import * as emailService from "@/services/email.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "@/config/env";

/**
 * Tạo mã OTP (6 chữ số)
 */
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  await userOtpRepository.create({
    userId: user.id,
    otpCode: otp,
    type: "REGISTER",
    expiresAt,
  });

  await emailService.sendRegisterOtp(email, otp, 10);

  return {
    success: true,
    message:
      "Tài khoản được tạo thành công. Vui lòng kiểm tra email để nhận mã OTP.",
    userId: user.id,
    email: user.email,
  };
};

export const verifyRegisterOtp = async (userId: number, otpCode: string) => {
  const userOtp = await userOtpRepository.findByCode(otpCode, "REGISTER");
  if (!userOtp) {
    throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");
  }

  if (userOtp.userId !== userId) {
    throw new Error("Mã OTP không phù hợp với tài khoản");
  }

  await userOtpRepository.markAsUsed(userOtp.id);

  const user = await userRepository.update(userId, {
    status: "VERIFIED",
  });

  await emailService.sendRegistrationSuccess(
    user.email,
    user.firstName || "Khách hàng",
  );

  return {
    success: true,
    message: "Xác thực email thành công. Bạn có thể đăng nhập ngay.",
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
    },
  };
};

export const resendRegisterOtp = async (userId: number) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("Người dùng không tìm thấy");
  }

  if (user.status === "VERIFIED") {
    throw new Error("Tài khoản đã được kích hoạt");
  }

  await userOtpRepository.deleteExpiredOtps(userId);

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await userOtpRepository.create({
    userId,
    otpCode: otp,
    type: "REGISTER",
    expiresAt,
  });

  await emailService.sendRegisterOtp(user.email, otp, 10);

  return {
    success: true,
    message: "Mã OTP mới đã được gửi đến email của bạn",
  };
};

export const login = async (email: string, password: string) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
  }

  if (user.status === "UNVERIFIED") {
    throw new Error(
      "Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước.",
    );
  }

  if (user.status === "LOCKED") {
    throw new Error("Tài khoản bị khóa. Vui lòng liên hệ quản trị viên.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    },
    token,
  };
};

export const sendResetPasswordOtp = async (email: string) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    return {
      success: true,
      message:
        "Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi đến email của bạn.",
    };
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

  await userOtpRepository.create({
    userId: user.id,
    otpCode: otp,
    type: "FORGOT_PASSWORD",
    expiresAt,
  });

  await emailService.sendResetPasswordOtp(email, otp, 15);

  return {
    success: true,
    message:
      "Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi đến email của bạn.",
  };
};

export const resetPasswordWithOtp = async (
  email: string,
  otpCode: string,
  newPassword: string,
) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error("Email không tìm thấy");
  }

  const userOtp = await userOtpRepository.findByCode(
    otpCode,
    "FORGOT_PASSWORD",
  );
  if (!userOtp) {
    throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");
  }

  if (userOtp.userId !== user.id) {
    throw new Error("Mã OTP không phù hợp với email này");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userRepository.updatePassword(user.id, hashedPassword);

  await userOtpRepository.markAsUsed(userOtp.id);

  return {
    success: true,
    message: "Mật khẩu đã được thay đổi thành công.",
  };
};

export const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }
};

export const refreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      ignoreExpiration: true,
    }) as any;

    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return {
      success: true,
      token: newToken,
    };
  } catch (error) {
    throw new Error("Token không hợp lệ");
  }
};
