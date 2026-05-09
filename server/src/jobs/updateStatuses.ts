import prisma from '@/config/database';

/**
 * Background job to update booking statuses
 * Runs daily to check for expired bookings and update statuses
 */
export async function updateBookingStatuses() {
  try {
    console.log('⏰ Running job: Update booking statuses');

    const now = new Date();

    // Update completed bookings (checkout date has passed)
    const completedBookings = await prisma.booking.updateMany({
      where: {
        AND: [
          { status: { not: 'cancelled' } },
          { checkOutDate: { lt: now } },
        ],
      },
      data: {
        status: 'completed',
      },
    });

    console.log(`✅ Updated ${completedBookings.count} bookings to completed`);
  } catch (error) {
    console.error('❌ Error updating booking statuses:', error);
  }
}
