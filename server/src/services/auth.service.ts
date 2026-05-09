import { userRepository } from '@/repositories/user.repository';
import { userOtpRepository } from '@/repositories/userOtp.repository';
import { emailService } from '@/services/email.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '@/config/env';

/**
 * Auth Service
 * Xử lý đăng ký, đăng nhập, xác thực OTP, quên mật khẩu
 */

export class AuthService {
  /**
   * Tạo mã OTP (6 chữ số)
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Bước 1: Đăng ký - Tạo tài khoản và gửi OTP
   */
  async register(email: string, password: string, firstName: string, lastName: string) {
    // 1. Kiểm tra email đã tồn tại
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    // 2. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Tạo user mới với status UNVERIFIED
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // 4. Tạo mã OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // 5. Lưu OTP vào database
    await userOtpRepository.create({
      userId: user.id,
      otpCode: otp,
      type: 'REGISTER',
      expiresAt,
    });

    // 6. Gửi OTP qua email
    await emailService.sendRegisterOtp(email, otp, 10);

    return {
      success: true,
      message: 'Tài khoản được tạo thành công. Vui lòng kiểm tra email để nhận mã OTP.',
      userId: user.id,
      email: user.email,
    };
  }

  /**
   * Bước 2: Xác thực OTP (Kích hoạt tài khoản)
   */
  async verifyRegisterOtp(userId: number, otpCode: string) {
    // 1. Tìm OTP
    const userOtp = await userOtpRepository.findByCode(otpCode, 'REGISTER');
    if (!userOtp) {
      throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // 2. Kiểm tra user ID khớp
    if (userOtp.userId !== userId) {
      throw new Error('Mã OTP không phù hợp với tài khoản');
    }

    // 3. Đánh dấu OTP đã sử dụng
    await userOtpRepository.markAsUsed(userOtp.id);

    // 4. Cập nhật trạng thái user thành VERIFIED
    const user = await userRepository.update(userId, {
      status: 'VERIFIED',
    });

    // 5. Gửi email xác nhận thành công
    await emailService.sendRegistrationSuccess(user.email, user.firstName || 'Khách hàng');

    return {
      success: true,
      message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay.',
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    };
  }

  /**
   * Gửi lại OTP cho đăng ký
   */
  async resendRegisterOtp(userId: number) {
    // 1. Tìm user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tìm thấy');
    }

    if (user.status === 'VERIFIED') {
      throw new Error('Tài khoản đã được kích hoạt');
    }

    // 2. Xóa OTP cũ
    await userOtpRepository.deleteExpiredOtps(userId);

    // 3. Tạo OTP mới
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await userOtpRepository.create({
      userId,
      otpCode: otp,
      type: 'REGISTER',
      expiresAt,
    });

    // 4. Gửi email
    await emailService.sendRegisterOtp(user.email, otp, 10);

    return {
      success: true,
      message: 'Mã OTP mới đã được gửi đến email của bạn',
    };
  }

  /**
   * Đăng nhập
   */
  async login(email: string, password: string) {
    // 1. Tìm user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // 2. Kiểm tra trạng thái tài khoản
    if (user.status === 'UNVERIFIED') {
      throw new Error('Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước.');
    }

    if (user.status === 'LOCKED') {
      throw new Error('Tài khoản bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // 3. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // 4. Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Trả về user info (không gửi password)
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
  }

  /**
   * Gửi OTP để quên mật khẩu
   */
  async sendResetPasswordOtp(email: string) {
    // 1. Tìm user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Không bao lộ email có tồn tại hay không (security)
      return {
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi đến email của bạn.',
      };
    }

    // 2. Tạo OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await userOtpRepository.create({
      userId: user.id,
      otpCode: otp,
      type: 'FORGOT_PASSWORD',
      expiresAt,
    });

    // 3. Gửi email
    await emailService.sendResetPasswordOtp(email, otp, 15);

    return {
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi đến email của bạn.',
    };
  }

  /**
   * Xác thực OTP và đặt lại mật khẩu
   */
  async resetPasswordWithOtp(email: string, otpCode: string, newPassword: string) {
    // 1. Tìm user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Email không tìm thấy');
    }

    // 2. Tìm OTP
    const userOtp = await userOtpRepository.findByCode(otpCode, 'FORGOT_PASSWORD');
    if (!userOtp) {
      throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // 3. Kiểm tra user ID khớp
    if (userOtp.userId !== user.id) {
      throw new Error('Mã OTP không phù hợp với email này');
    }

    // 4. Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Cập nhật mật khẩu
    await userRepository.updatePassword(user.id, hashedPassword);

    // 6. Đánh dấu OTP đã sử dụng
    await userOtpRepository.markAsUsed(userOtp.id);

    return {
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công.',
    };
  }

  /**
   * Xác thực Token
   */
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  /**
   * Refresh Token
   */
  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, { ignoreExpiration: true }) as any;

      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        token: newToken,
      };
    } catch (error) {
      throw new Error('Token không hợp lệ');
    }
  }
}

export const authService = new AuthService();
