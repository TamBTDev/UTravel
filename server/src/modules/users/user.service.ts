import * as userRepository from "../../repositories/user.repository";

export const getProfile = async (userId: number) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("Người dùng không tìm thấy");
  return user;
};

export const updateProfile = async (
  userId: number,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  },
) => {
  const existing = await userRepository.findById(userId);
  if (!existing) throw new Error("Người dùng không tìm thấy");

  return await userRepository.update(userId, data);
};
