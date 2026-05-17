import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export interface GetHotelsFilter {
  search?: string | null;
  city?: string | null;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  capacity?: number;
  checkIn?: string | null;
  checkOut?: string | null;
  sortBy?: string | null;
  page: number;
  limit: number;
}

export const hotelsService = {
  /**
   * Lấy danh sách khách sạn có phân trang, tìm kiếm và bộ lọc nhiều điều kiện
   */
  getHotels: async (filters: GetHotelsFilter) => {
    const {
      search,
      city,
      minPrice,
      maxPrice,
      rating,
      capacity,
      checkIn,
      checkOut,
      sortBy,
      page = 1,
      limit = 10,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.HotelWhereInput = {};

    if (search) {
      where.name = { contains: search };
    }

    if (city) {
      where.city = { contains: city };
    }

    if (rating) {
      where.rating = { gte: rating };
    }

    const roomConditions: Prisma.RoomWhereInput = {};
    let hasRoomCondition = false;

    if (minPrice !== undefined || maxPrice !== undefined) {
      roomConditions.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
      hasRoomCondition = true;
    }

    if (capacity !== undefined) {
      roomConditions.capacity = { gte: capacity };
      hasRoomCondition = true;
    }

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      roomConditions.bookings = {
        none: {
          AND: [
            { checkInDate: { lt: checkOutDate } },
            { checkOutDate: { gt: checkInDate } },
            { status: { in: ["confirmed", "pending"] } },
          ],
        },
      };
      hasRoomCondition = true;
    }

    if (hasRoomCondition) {
      where.rooms = {
        some: roomConditions,
      };
    }

    // Lấy toàn bộ dữ liệu thỏa mãn điều kiện (để hỗ trợ sort theo price của room)
    const allData = await prisma.hotel.findMany({
      where,
      include: {
        rooms: {
          orderBy: { price: "asc" },
          take: 1,
          select: { price: true, type: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    let sortedData = [...allData];
    switch (sortBy) {
      case "price_asc":
        sortedData.sort(
          (a, b) => (a.rooms[0]?.price || 0) - (b.rooms[0]?.price || 0),
        );
        break;
      case "price_desc":
        sortedData.sort(
          (a, b) => (b.rooms[0]?.price || 0) - (a.rooms[0]?.price || 0),
        );
        break;
      case "rating_desc":
        sortedData.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        sortedData.sort((a, b) => b._count.reviews - a._count.reviews);
        break;
      default: // newest
        sortedData.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        break;
    }

    const total = sortedData.length;
    const data = sortedData.slice(skip, skip + limit);

    return {
      total,
      data,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Lấy danh sách khách sạn nổi bật / khuyến mãi cho Trang chủ
   */
  getFeaturedHotels: async (limit: number = 6) => {
    const data = await prisma.hotel.findMany({
      take: limit,
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      include: {
        rooms: {
          orderBy: { price: "asc" },
          take: 1,
          select: { price: true, type: true },
        },
      },
    });
    return data;
  },

  /**
   * Lấy danh sách điểm đến phổ biến (gom nhóm theo thành phố)
   */
  getDestinations: async (limit: number = 4) => {
    const grouped = await prisma.hotel.groupBy({
      by: ["city"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });

    const destinations = await Promise.all(
      grouped.map(async (g) => {
        const hotel = await prisma.hotel.findFirst({
          where: { city: g.city },
          select: { images: true },
        });

        let imageUrl =
          //fallback
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80";
        if (hotel?.images) {
          const imgs =
            typeof hotel.images === "string"
              ? JSON.parse(hotel.images)
              : hotel.images;
          if (Array.isArray(imgs) && imgs.length > 0) imageUrl = imgs[0];
        }

        return {
          name: g.city,
          count: g._count.id,
          image: imageUrl,
        };
      }),
    );

    return destinations;
  },

  /**
   * PERSON B: Lấy chi tiết khách sạn cùng danh sách phòng và reviews
   */
  getHotelDetail: async (hotelId: string) => {
    const id = Number(hotelId);
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        rooms: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!hotel) {
      throw new Error("Hotel not found");
    }

    return hotel;
  },

  /**
   * PERSON B: Lấy danh sách khách sạn tương tự (cùng thành phố)
   */
  getRelatedHotels: async (hotelId: string, limit: number = 4) => {
    const id = Number(hotelId);
    // Get the base hotel to know its city
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      select: { city: true, rating: true, id: true },
    });

    if (!hotel) {
      throw new Error("Hotel not found");
    }

    // Get hotels in the same city, excluding this one
    const relatedHotels = await prisma.hotel.findMany({
      where: {
        city: hotel.city,
        NOT: { id: hotel.id },
      },
      take: limit,
      orderBy: { rating: "desc" },
    });

    return relatedHotels;
  },
};
