import { Router } from 'express';

const paymentRouter = Router();

paymentRouter.get('/', (req, res) => {
  // TODO: Implement get all payments
  res.json({ message: 'Get all payments' });
});

paymentRouter.post('/', (req, res) => {
  // TODO: Implement create payment
  res.json({ message: 'Create payment' });
});

paymentRouter.put('/:id', (req, res) => {
  // TODO: Implement update payment
  res.json({ message: 'Update payment' });
});

export default paymentRouter;
