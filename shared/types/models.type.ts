// ═══════════════════════════════════════
// User & Authentication
// ═══════════════════════════════════════

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  vendorProfile?: VendorProfile;
}

// ═══════════════════════════════════════
// Vendor / Chủ phòng
// ═══════════════════════════════════════

export interface VendorProfile {
  id: number;
  userId: number;
  shopName: string;
  description?: string;
  businessLicense?: string;
  bankName?: string;
  bankAccount?: string;
  bankOwner?: string;
  logo?: string;
  status: string;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  hotels?: Hotel[];
  wallet?: Wallet;
}

export interface Wallet {
  id: number;
  vendorId: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  transactions?: WalletTransaction[];
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  bookingId?: number;
  type: string;
  amount: number;
  description?: string;
  createdAt: Date;
}

// ═══════════════════════════════════════
// Hotel & Room
// ═══════════════════════════════════════

export interface Hotel {
  id: number;
  vendorId?: number;
  name: string;
  description?: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  amenities?: string[];
  images?: string[];
  approvalStatus: string;
  rejectReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  vendor?: VendorProfile;
  rooms?: Room[];
  reviews?: Review[];
}

export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  type: string;
  price: number;
  capacity: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  hotel?: Hotel;
}

// ═══════════════════════════════════════
// Booking & Payment
// ═══════════════════════════════════════

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  promotionId?: number;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  specialNote?: string;
  status: string;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  room?: Room;
  promotion?: Promotion;
  payment?: Payment;
  review?: Review;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  method: string;
  transactionId?: string;
  status: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════
// Review
// ═══════════════════════════════════════

export interface Review {
  id: number;
  userId: number;
  hotelId: number;
  bookingId?: number;
  rating: number;
  comment?: string;
  vendorReply?: string;
  vendorReplyAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  hotel?: Hotel;
}

// ═══════════════════════════════════════
// Promotion / Khuyến mãi
// ═══════════════════════════════════════

export interface Promotion {
  id: number;
  vendorId: number;
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════
// Support / Hỗ trợ khách hàng
// ═══════════════════════════════════════

export interface SupportTicket {
  id: number;
  userId: number;
  bookingId?: number;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: number;
  content: string;
  createdAt: Date;
  sender?: User;
}

// ═══════════════════════════════════════
// CMS / Quản lý nội dung
// ═══════════════════════════════════════

export interface CmsPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
