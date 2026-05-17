import prisma from "@/config/database";
import { User, Prisma } from "@prisma/client";

export const findById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const findByEmail = async (email: string) => {
  try {
    console.log("[USER_REPO] Looking up user by email:", email);
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    console.log("[USER_REPO] Email lookup result:", user ? "FOUND (ID: " + user.id + ")" : "NOT FOUND");
    return user;
  } catch (error: any) {
    console.error("[USER_REPO] Error finding user by email:", {
      email,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const findAll = async (skip: number, take: number) => {
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return { data, total };
};

export const create = async (data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<User> => {
  try {
    console.log("[USER_REPO] Creating user with email:", data.email);
    
    const user = await prisma.user.create({
      data,
    });
    
    console.log("[USER_REPO] User created successfully with ID:", user.id, "Status:", user.status);
    return user;
  } catch (error: any) {
    console.error("[USER_REPO] Error creating user:", {
      email: data.email,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    throw error;
  }
};

export const update = async (id: number, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      avatar: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
};

export const updatePassword = async (id: number, hashedPassword: string) => {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: { id: true, email: true },
  });
};

export const deleteUser = async (id: number) => {
  return prisma.user.delete({
    where: { id },
  });
};
