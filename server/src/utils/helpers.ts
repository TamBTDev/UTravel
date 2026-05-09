import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
};

export const calculateTotalPrice = (pricePerNight: number, nights: number): number => {
  return pricePerNight * nights;
};
