export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hotel {
  id: number;
  name: string;
  description?: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  type: string;
  price: number;
  capacity: number;
  description?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  checkInDate: Date;
  checkOutDate: Date;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  method: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
