import { Request, Response } from 'express';
import prisma from '../../config/database';

/**
 * GET /users/wallet — Lấy thông tin ví người dùng (số dư + lịch sử gần đây)
 */
export const getUserWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    // Lấy hoặc tạo ví
    const wallet = await prisma.userWallet.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {},
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        id: wallet.id,
        balance: wallet.balance,
        recentTransactions: wallet.transactions,
      },
    });
  } catch (error: any) {
    console.error('Error getting user wallet:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thông tin ví', error: error.message });
  }
};

/**
 * GET /users/wallet/transactions — Lấy toàn bộ lịch sử giao dịch ví có phân trang
 */
export const getUserWalletTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Tìm ví
    const wallet = await prisma.userWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return res.status(200).json({
        success: true,
        data: { transactions: [], total: 0, page, totalPages: 0 },
      });
    }

    const [transactions, total] = await prisma.$transaction([
      prisma.userWalletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userWalletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        transactions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử giao dịch', error: error.message });
  }
};
