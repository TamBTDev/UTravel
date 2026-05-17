import { Request, Response } from "express";
import { hotelsService } from "./hotels.service";

// Helper: Convert query params safely
const getStringParam = (val: any): string | null => {
  if (Array.isArray(val)) return val[0] || null;
  return val || null;
};

const getNumberParam = (val: any): number | undefined => {
  if (Array.isArray(val)) return Number(val[0]) || undefined;
  return val ? Number(val) : undefined;
};

// Helper: Convert route params safely (usually single string but can be array in rare cases)
const getIdParam = (val: any): string => {
  if (Array.isArray(val)) return val[0];
  return val;
};

export const getHotels = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: getStringParam(req.query.search),
      city: getStringParam(req.query.city),
      minPrice: getNumberParam(req.query.minPrice),
      maxPrice: getNumberParam(req.query.maxPrice),
      rating: getNumberParam(req.query.rating),
      capacity: getNumberParam(req.query.capacity),
      checkIn: getStringParam(req.query.checkIn),
      checkOut: getStringParam(req.query.checkOut),
      sortBy: getStringParam(req.query.sortBy),
      page: getNumberParam(req.query.page) || 1,
      limit: getNumberParam(req.query.limit) || 10,
    };

    const result = await hotelsService.getHotels(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Lỗi máy chủ khi lấy danh sách khách sạn",
    });
  }
};

export const getFeaturedHotels = async (req: Request, res: Response) => {
  try {
    const limit = getNumberParam(req.query.limit) || 6;
    const hotels = await hotelsService.getFeaturedHotels(limit);

    res.json({
      success: true,
      data: hotels,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Lỗi máy chủ khi lấy danh sách khách sạn nổi bật",
    });
  }
};

export const getDestinations = async (req: Request, res: Response) => {
  try {
    const limit = getNumberParam(req.query.limit) || 4;
    const destinations = await hotelsService.getDestinations(limit);

    res.json({
      success: true,
      data: destinations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Lỗi máy chủ khi lấy danh sách điểm đến",
    });
  }
};

/**
 * PERSON B: Lấy chi tiết khách sạn với danh sách phòng và reviews
 */
export const getHotelDetail = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);

    const hotel = await hotelsService.getHotelDetail(id);

    res.json({
      success: true,
      data: hotel,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message || "Khách sạn không tìm thấy",
    });
  }
};

/**
 * PERSON B: Lấy danh sách khách sạn tương tự (cùng thành phố)
 */
export const getRelatedHotels = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const limit = getNumberParam(req.query.limit) || 4;

    const relatedHotels = await hotelsService.getRelatedHotels(id, limit);

    res.json({
      success: true,
      data: relatedHotels,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message || "Không thể lấy danh sách khách sạn tương tự",
    });
  }
};
