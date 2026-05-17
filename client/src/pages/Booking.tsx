import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Stack,
  Button,
  NumberInput,
  Textarea,
  Text,
  Title,
  Group,
  Card,
  Loader,
  Alert,
  Divider,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { createBookingThunk, clearError, clearSuccess } from '@/app/store/bookingSlice';
import { getRoomDetail } from '@/features/hotel/services/hotelService';
import dayjs from 'dayjs';

interface Room {
  id: string;
  type: string;
  price: number;
  capacity: number;
  roomNumber: string;
  amenities: string[];
}

export const BookingPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error, success, currentBooking } = useSelector(
    (state: any) => state.booking
  );

  const roomId = searchParams.get('roomId');
  const hotelId = searchParams.get('hotelId');

  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);

  const [checkInDate, setCheckInDate] = useState<Date | null>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    new Date(Date.now() + 86400000)
  );
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  // Load room details
  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        setRoomError('Room ID is missing');
        setRoomLoading(false);
        return;
      }

      try {
        setRoomLoading(true);
        setRoomError(null);
        const roomData = await getRoomDetail(roomId);
        setRoom(roomData);
      } catch (err: any) {
        setRoomError(err.message || 'Failed to load room details');
        console.error('Error loading room:', err);
      } finally {
        setRoomLoading(false);
      }
    };

    loadRoom();
  }, [roomId]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success && currentBooking) {
      const timer = setTimeout(() => {
        navigate(`/payment?bookingId=${currentBooking.id}&totalPrice=${currentBooking.totalPrice}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, currentBooking, navigate]);

  const handleBooking = async () => {
    // Validation
    if (!roomId) {
      alert('Room ID is required');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      alert('Please select both check-in and check-out dates');
      return;
    }

    if (checkInDate >= checkOutDate) {
      alert('Check-out date must be after check-in date');
      return;
    }

    if (numberOfGuests < 1) {
      alert('Number of guests must be at least 1');
      return;
    }

    if (room && numberOfGuests > room.capacity) {
      alert(`Maximum capacity for this room is ${room.capacity} guests`);
      return;
    }

    const bookingData = {
      roomId,
      checkInDate: dayjs(checkInDate).format('YYYY-MM-DD'),
      checkOutDate: dayjs(checkOutDate).format('YYYY-MM-DD'),
      numberOfGuests,
      specialRequests: specialRequests.trim(),
    };

    (dispatch as any)(createBookingThunk(bookingData));
  };

  const nights = checkInDate && checkOutDate 
    ? dayjs(checkOutDate).diff(dayjs(checkInDate), 'day')
    : 0;

  const totalPrice = room ? room.price * nights : 0;

  if (roomLoading) {
    return (
      <Container size="md" py="xl">
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      </Container>
    );
  }

  if (roomError || !room) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle />} color="red" title="Error">
          {roomError || 'Room not found'}
        </Alert>
        <Button mt="md" onClick={() => navigate('/hotels')}>
          Back to Hotels
        </Button>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Complete Your Booking</Title>
          <Text c="dimmed">
            Room {room.roomNumber} - {room.type}
          </Text>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert icon={<IconAlertCircle />} color="red" title="Booking Failed">
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && currentBooking && (
          <Alert icon={<IconCircleCheck />} color="green" title="Booking Successful">
            Your booking has been created. Redirecting to payment...
          </Alert>
        )}

        {/* Room Summary */}
        <Card withBorder p="lg" radius="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fw={600}>Room Type:</Text>
              <Text>{room.type}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600}>Price per Night:</Text>
              <Text>${room.price}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={600}>Capacity:</Text>
              <Text>{room.capacity} guests</Text>
            </Group>
            {room.amenities && room.amenities.length > 0 && (
              <div>
                <Text fw={600} mb="xs">
                  Amenities:
                </Text>
                <Text size="sm">{room.amenities.join(', ')}</Text>
              </div>
            )}
          </Stack>
        </Card>

        <Divider />

        {/* Booking Form */}
        <Stack gap="md">
          <DatePickerInput
            label="Check-in Date"
            placeholder="Select check-in date"
            value={checkInDate}
            onChange={setCheckInDate}
            minDate={new Date()}
            required
          />

          <DatePickerInput
            label="Check-out Date"
            placeholder="Select check-out date"
            value={checkOutDate}
            onChange={setCheckOutDate}
            minDate={checkInDate || new Date()}
            required
          />

          <NumberInput
            label="Number of Guests"
            placeholder="How many guests?"
            value={numberOfGuests}
            onChange={(val) => setNumberOfGuests(val || 1)}
            min={1}
            max={room.capacity}
            required
          />

          <Textarea
            label="Special Requests (Optional)"
            placeholder="Any special requests? (e.g., high floor, crib for baby, etc.)"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.currentTarget.value)}
            rows={4}
            minRows={3}
          />
        </Stack>

        <Divider />

        {/* Pricing Summary */}
        <Card withBorder p="lg" radius="md" bg="gray-0">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text>
                ${room.price} × {nights} night{nights !== 1 ? 's' : ''}
              </Text>
              <Text>${room.price * nights}</Text>
            </Group>
            {totalPrice > 0 && (
              <>
                <Divider />
                <Group justify="space-between">
                  <Text fw={700} size="lg">
                    Total Price:
                  </Text>
                  <Text fw={700} size="lg" color="blue">
                    ${totalPrice}
                  </Text>
                </Group>
              </>
            )}
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Group grow>
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            loading={isLoading}
            onClick={handleBooking}
            size="lg"
            disabled={!checkInDate || !checkOutDate || totalPrice === 0}
          >
            {isLoading ? 'Creating Booking...' : 'Proceed to Payment'}
          </Button>
        </Group>

        {/* Info Message */}
        <Alert icon={<IconAlertCircle />} color="blue" title="Booking Information">
          You'll be able to review and pay for your booking on the next page. No charges will be made until you confirm the payment.
        </Alert>
      </Stack>
    </Container>
  );
};
export const Booking = () => {
  return <div>Booking</div>;
};
