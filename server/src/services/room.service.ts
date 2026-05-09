import { roomRepository } from '@/repositories/room.repository';
import { hotelRepository } from '@/repositories/hotel.repository';

export class RoomService {
  async getRoomsByHotel(hotelId: number, page: number = 1, limit: number = 10) {
    // Verify hotel exists
    const hotel = await hotelRepository.findById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const skip = (page - 1) * limit;
    const result = await roomRepository.findByHotelId(hotelId, skip, limit);

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getRoomById(id: number) {
    const room = await roomRepository.findById(id);
    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  async getAvailableRooms(hotelId: number, checkIn: Date, checkOut: Date) {
    return roomRepository.findAvailable(hotelId, checkIn, checkOut);
  }

  async createRoom(data: {
    hotelId: number;
    roomNumber: string;
    type: string;
    price: number;
    capacity: number;
    description?: string;
    amenities?: string;
  }) {
    // Verify hotel exists
    const hotel = await hotelRepository.findById(data.hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    return roomRepository.create(data);
  }

  async updateRoom(
    id: number,
    data: {
      roomNumber?: string;
      type?: string;
      price?: number;
      capacity?: number;
      description?: string;
      amenities?: string;
      isAvailable?: boolean;
    }
  ) {
    const room = await roomRepository.findById(id);
    if (!room) {
      throw new Error('Room not found');
    }

    return roomRepository.update(id, data);
  }

  async deleteRoom(id: number) {
    const room = await roomRepository.findById(id);
    if (!room) {
      throw new Error('Room not found');
    }

    return roomRepository.delete(id);
  }
}

export const roomService = new RoomService();
