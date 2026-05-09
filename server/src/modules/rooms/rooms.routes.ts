import { Router } from 'express';

const roomRouter = Router();

roomRouter.get('/', (req, res) => {
  // TODO: Implement get all rooms
  res.json({ message: 'Get all rooms' });
});

roomRouter.get('/:id', (req, res) => {
  // TODO: Implement get room by ID
  res.json({ message: 'Get room by ID' });
});

roomRouter.post('/', (req, res) => {
  // TODO: Implement create room
  res.json({ message: 'Create room' });
});

roomRouter.put('/:id', (req, res) => {
  // TODO: Implement update room
  res.json({ message: 'Update room' });
});

roomRouter.delete('/:id', (req, res) => {
  // TODO: Implement delete room
  res.json({ message: 'Delete room' });
});

export default roomRouter;
