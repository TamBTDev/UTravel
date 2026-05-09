import { Router } from 'express';

const userRouter = Router();

userRouter.get('/profile', (req, res) => {
  // TODO: Implement get profile
  res.json({ message: 'Get user profile' });
});

userRouter.put('/profile', (req, res) => {
  // TODO: Implement update profile
  res.json({ message: 'Update user profile' });
});

userRouter.get('/bookings', (req, res) => {
  // TODO: Implement get user bookings
  res.json({ message: 'Get user bookings' });
});

export default userRouter;
