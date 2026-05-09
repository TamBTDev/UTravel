import { Router } from 'express';

const bookingRouter = Router();

bookingRouter.get('/', (req, res) => {
  // TODO: Implement get all bookings
  res.json({ message: 'Get all bookings' });
});

bookingRouter.get('/:id', (req, res) => {
  // TODO: Implement get booking by ID
  res.json({ message: 'Get booking by ID' });
});

bookingRouter.post('/', (req, res) => {
  // TODO: Implement create booking
  res.json({ message: 'Create booking' });
});

bookingRouter.put('/:id', (req, res) => {
  // TODO: Implement update booking
  res.json({ message: 'Update booking' });
});

bookingRouter.delete('/:id', (req, res) => {
  // TODO: Implement delete booking
  res.json({ message: 'Delete booking' });
});

export default bookingRouter;
