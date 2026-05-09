import { Router } from 'express';

const hotelRouter = Router();

hotelRouter.get('/', (req, res) => {
  // TODO: Implement get all hotels
  res.json({ message: 'Get all hotels' });
});

hotelRouter.get('/:id', (req, res) => {
  // TODO: Implement get hotel by ID
  res.json({ message: 'Get hotel by ID' });
});

hotelRouter.post('/', (req, res) => {
  // TODO: Implement create hotel
  res.json({ message: 'Create hotel' });
});

hotelRouter.put('/:id', (req, res) => {
  // TODO: Implement update hotel
  res.json({ message: 'Update hotel' });
});

hotelRouter.delete('/:id', (req, res) => {
  // TODO: Implement delete hotel
  res.json({ message: 'Delete hotel' });
});

export default hotelRouter;
