import { Request, Response } from "express";
import { z } from "zod";
import * as userService from "./user.service";

const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Tên không được bỏ trống")
      .max(50, "Tên tối đa 50 ký tự")
      .optional(),
    lastName: z
      .string()
      .min(1, "Họ không được bỏ trống")
      .max(50, "Họ tối đa 50 ký tự")
      .optional(),
    phone: z
      .string()
      .regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ (9–11 chữ số)")
      .optional()
      .or(z.literal("")),
    address: z.string().max(200, "Địa chỉ tối đa 200 ký tự").optional(),
    avatar: z
      .string()
      .url("Avatar phải là URL hợp lệ")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data: Record<string, unknown>) =>
      Object.values(data).some((v) => v !== undefined),
    { message: "Cần cung cấp ít nhất một trường để cập nhật" },
  );

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const profile = await userService.getProfile(userId);
    return res.json({ success: true, data: profile });
  } catch (error: any) {
    return res.status(404).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const data = updateProfileSchema.parse(req.body);

    const sanitized = Object.fromEntries(
      Object.entries(data).filter(
        (entry): boolean => entry[1] !== undefined && entry[1] !== "",
      ),
    ) as typeof data;

    const updated = await userService.updateProfile(userId, sanitized);
    return res.json({
      success: true,
      message: "Cập nhật profile thành công",
      data: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Dữ liệu không hợp lệ",
        details: error.errors,
      });
    }
    return res.status(400).json({ success: false, error: error.message });
  }
};
