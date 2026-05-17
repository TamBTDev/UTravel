import { Request, Response } from "express";
import { hotelsService } from "./hotels.service";

export const getHotels = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      city: req.query.city as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      rating: req.query.rating ? Number(req.query.rating) : undefined,
      capacity: req.query.capacity ? Number(req.query.capacity) : undefined,
      checkIn: req.query.checkIn as string,
      checkOut: req.query.checkOut as string,
      sortBy: req.query.sortBy as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
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
    const limit = req.query.limit ? Number(req.query.limit) : 6;
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
    const limit = req.query.limit ? Number(req.query.limit) : 4;
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
