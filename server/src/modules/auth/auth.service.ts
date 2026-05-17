import * as userRepository from "@/modules/users/user.repository";
import * as userOtpRepository from "@/modules/users/userOtp.repository";
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
  try {
    console.log("[REGISTER] Starting registration for email:", email);

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    console.log("[REGISTER] Checking existing user:", existingUser ? "FOUND" : "NOT FOUND");
    
    if (existingUser) {
      console.log("[REGISTER] User already exists with email:", email);
      throw new Error("Email đã được sử dụng");
    }

    // Hash password
    console.log("[REGISTER] Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("[REGISTER] Password hashed successfully");

    // Create user in database
    console.log("[REGISTER] Creating user in database...");
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    console.log("[REGISTER] User created successfully with ID:", user.id);

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
    console.log("[REGISTER] Generated OTP:", otp, "Expires at:", expiresAt);

    // Save OTP to database
    console.log("[REGISTER] Saving OTP to database...");
    const savedOtp = await userOtpRepository.create({
      userId: user.id,
      otpCode: otp,
      type: "REGISTER",
      expiresAt,
    });
    console.log("[REGISTER] OTP saved successfully with ID:", savedOtp.id);

    // Send email with OTP
    console.log("[REGISTER] Sending OTP email to:", email);
    await emailService.sendRegisterOtp(email, otp, 10);
    console.log("[REGISTER] Email sent successfully");

    console.log("[REGISTER] Registration completed successfully for user ID:", user.id);

    return {
      success: true,
      message:
        "Tài khoản được tạo thành công. Vui lòng kiểm tra email để nhận mã OTP.",
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error("[REGISTER] Error occurred:", {
      message: error instanceof Error ? error.message : String(error),
      email,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
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
  try {
    console.log("[LOGIN] Attempting login for email:", email);

    const user = await userRepository.findByEmail(email);
    console.log("[LOGIN] User lookup result:", user ? "FOUND" : "NOT FOUND");
    
    if (!user) {
      console.log("[LOGIN] User not found for email:", email);
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    if (user.status === "UNVERIFIED") {
      console.log("[LOGIN] User not verified yet:", email);
      throw new Error(
        "Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước.",
      );
    }

    if (user.status === "LOCKED") {
      console.log("[LOGIN] User account locked:", email);
      throw new Error("Tài khoản bị khóa. Vui lòng liên hệ quản trị viên.");
    }

    console.log("[LOGIN] Verifying password for user:", email);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("[LOGIN] Password verification failed for user:", email);
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    console.log("[LOGIN] Password verified successfully for user:", email);
    console.log("[LOGIN] Generating JWT token...");
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log("[LOGIN] Login successful for user ID:", user.id);

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
  } catch (error) {
    console.error("[LOGIN] Error occurred:", {
      message: error instanceof Error ? error.message : String(error),
      email,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
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
