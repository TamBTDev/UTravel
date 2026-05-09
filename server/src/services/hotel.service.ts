import { hotelRepository } from '@/repositories/hotel.repository';
import { reviewRepository } from '@/repositories/review.repository';

export class HotelService {
  async getAllHotels(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const result = await hotelRepository.findAll(skip, limit);

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

  async getHotelById(id: number) {
    const hotel = await hotelRepository.findById(id);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Get average rating
    const avgRating = await reviewRepository.getAverageRating(id);

    return {
      ...hotel,
      avgRating,
    };
  }

  async searchByLocation(location: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const result = await hotelRepository.findByLocation(location, skip, limit);

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

  async createHotel(data: {
    name: string;
    description?: string;
    location: string;
    city: string;
    country: string;
    amenities?: string;
  }) {
    // Check if hotel name already exists
    const hotelByName = await hotelRepository.findAll(0, 1000);
    const exists = hotelByName.data.some((h) => h.name === data.name);
    if (exists) {
      throw new Error('Hotel name already exists');
    }

    return hotelRepository.create(data);
  }

  async updateHotel(
    id: number,
    data: {
      name?: string;
      description?: string;
      location?: string;
      city?: string;
      country?: string;
      amenities?: string;
    }
  ) {
    const hotel = await hotelRepository.findById(id);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    return hotelRepository.update(id, data);
  }

  async deleteHotel(id: number) {
    const hotel = await hotelRepository.findById(id);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    return hotelRepository.delete(id);
  }
}

export const hotelService = new HotelService();
