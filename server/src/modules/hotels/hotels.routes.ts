import { Router } from "express";
import * as hotelsController from "./hotels.controller";

const hotelsRouter = Router();

// Route: /api/hotels/featured
// Lấy danh sách khách sạn nổi bật (Trang chủ)
hotelsRouter.get("/featured", hotelsController.getFeaturedHotels);

// Lấy danh sách điểm đến phổ biến
hotelsRouter.get("/destinations", hotelsController.getDestinations);

// Route: /api/hotels
// Lấy danh sách khách sạn với tìm kiếm và bộ lọc (Trang danh sách)
hotelsRouter.get("/", hotelsController.getHotels);

export default hotelsRouter;
