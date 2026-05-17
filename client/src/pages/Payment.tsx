import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Stack,
  Button,
  Select,
  Text,
  Title,
  Group,
  Card,
  Loader,
  Alert,
  Badge,
  Divider,
  Grid,
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconCreditCard, IconBuildingBank } from '@tabler/icons-react';
import { createPayment, getBookingDetail } from '@/features/booking/services/bookingService';
import { AppLayout } from '../components/layout';

interface Booking {
  id: string;
  totalPrice: number;
  room?: { type: string; hotel?: { name: string } };
  checkInDate: string;
  checkOutDate: string;
}

const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card', icon: IconCreditCard },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: IconBuildingBank },
  { value: 'momo', label: 'MoMo Wallet', icon: null },
  { value: 'vnpay', label: 'VNPay', icon: null },
];

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const bookingId = searchParams.get('bookingId');
  const totalPrice = searchParams.get('totalPrice');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState<string | null>('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  // Load booking details
  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        setError('Booking ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const bookingData = await getBookingDetail(bookingId);
        setBooking(bookingData);
      } catch (err: any) {
        setError(err.message || 'Failed to load booking details');
        console.error('Error loading booking:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    if (!bookingId || !selectedMethod) {
      setPaymentError('Please select a payment method');
      return;
    }

    // Validate card details if credit card is selected
    if (selectedMethod === 'credit_card') {
      if (
        !cardDetails.cardNumber ||
        !cardDetails.cardHolder ||
        !cardDetails.expiryDate ||
        !cardDetails.cvv
      ) {
        setPaymentError('Please fill in all card details');
        return;
      }
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      // Call payment API
      const result = await createPayment({
        bookingId,
        method: selectedMethod,
      });

      setPaymentSuccess(true);

      // Redirect to confirmation page after 2 seconds
      setTimeout(() => {
        navigate(`/bookings/${bookingId}`);
      }, 2000);
    } catch (err: any) {
      setPaymentError(err.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Container size="md" py="xl">
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        </Container>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Container size="md" py="xl">
          <Alert icon={<IconAlertCircle />} color="red" title="Error">
            {error}
          </Alert>
          <Button mt="md" onClick={() => navigate('/hotels')}>
            Back to Hotels
          </Button>
        </Container>
      </AppLayout>
    );
  }

  const amount = parseFloat(totalPrice || '0');

  return (
    <AppLayout>
      <Container size="md" py="xl">
        <Stack gap="xl">
          <div>
            <Title order={1}>Payment</Title>
            <Text c="dimmed">Complete your payment to confirm your booking</Text>
          </div>

          {paymentError && (
            <Alert icon={<IconAlertCircle />} color="red" title="Payment Failed">
              {paymentError}
            </Alert>
          )}

          {paymentSuccess && (
            <Alert icon={<IconCircleCheck />} color="green" title="Payment Successful">
              Your payment has been processed. Redirecting to booking confirmation...
            </Alert>
          )}

          {/* Booking Summary */}
          <Card withBorder p="lg" radius="md" bg="gray-0">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600}>Booking ID</Text>
                <Badge>{bookingId}</Badge>
              </Group>

              {booking && (
                <>
                  <Divider />
                  <Group justify="space-between">
                    <Text fw={600}>Hotel</Text>
                    <Text>{booking.room?.hotel?.name || 'N/A'}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text fw={600}>Room Type</Text>
                    <Text>{booking.room?.type || 'N/A'}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text fw={600}>Check-in</Text>
                    <Text>{new Date(booking.checkInDate).toLocaleDateString()}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text fw={600}>Check-out</Text>
                    <Text>{new Date(booking.checkOutDate).toLocaleDateString()}</Text>
                  </Group>
                </>
              )}

              <Divider />

              <Group justify="space-between">
                <Text fw={700} size="lg">
                  Total Amount
                </Text>
                <Text fw={700} size="lg" color="blue">
                  ${amount.toFixed(2)}
                </Text>
              </Group>
            </Stack>
          </Card>

          {/* Payment Method Selection */}
          <div>
            <Text fw={600} mb="md">
              Select Payment Method
            </Text>
            <Grid>
              {PAYMENT_METHODS.map((method) => (
                <Grid.Col key={method.value} span={{ base: 12, sm: 6 }}>
                  <Card
                    p="md"
                    radius="md"
                    withBorder
                    className={`cursor-pointer transition-all ${
                      selectedMethod === method.value
                        ? 'border-blue-500 border-2 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedMethod(method.value)}
                  >
                    <Group>
                      <div>
                        <Text fw={600}>{method.label}</Text>
                        <Text size="xs" c="dimmed">
                          {method.value === 'credit_card'
                            ? 'Visa, Mastercard'
                            : 'Direct transfer'}
                        </Text>
                      </div>
                    </Group>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </div>

          {/* Card Details Form (if credit card selected) */}
          {selectedMethod === 'credit_card' && !paymentSuccess && (
            <Card withBorder p="lg" radius="md" bg="blue-50">
              <Stack gap="md">
                <Text fw={600}>Card Details</Text>

                <div>
                  <Text size="sm" fw={500} mb={4}>
                    Card Number
                  </Text>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={19}
                  />
                </div>

                <div>
                  <Text size="sm" fw={500} mb={4}>
                    Card Holder Name
                  </Text>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={cardDetails.cardHolder}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cardHolder: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Group grow>
                  <div>
                    <Text size="sm" fw={500} mb={4}>
                      Expiry Date
                    </Text>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Text size="sm" fw={500} mb={4}>
                      CVV
                    </Text>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, cvv: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={3}
                    />
                  </div>
                </Group>

                <Alert icon={<IconAlertCircle />} color="yellow" title="Test Card">
                  For testing: 4111 1111 1111 1111 | Any future date | Any CVV
                </Alert>
              </Stack>
            </Card>
          )}

          {/* Action Buttons */}
          {!paymentSuccess && (
            <Group grow>
              <Button
                variant="default"
                onClick={() => navigate(-1)}
                disabled={processingPayment}
              >
                Back
              </Button>
              <Button
                loading={processingPayment}
                onClick={handlePayment}
                size="lg"
              >
                {processingPayment ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
              </Button>
            </Group>
          )}

          {/* Security Info */}
          <Alert icon={<IconAlertCircle />} color="blue" title="Secure Payment">
            Your payment information is encrypted and secure. We accept all major credit cards and digital wallets.
          </Alert>
        </Stack>
      </Container>
    </AppLayout>
  );
};
