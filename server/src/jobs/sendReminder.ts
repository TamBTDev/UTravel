import prisma from '@/config/database';

/**
 * Background job to send booking reminders
 * Sends reminder emails 1 day before check-in
 */
export async function sendReminder() {
  try {
    console.log('⏰ Running job: Send booking reminders');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Find bookings with check-in tomorrow
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        AND: [
          { checkInDate: { gte: tomorrow } },
          { checkInDate: { lt: endOfTomorrow } },
          { status: { not: 'cancelled' } },
        ],
      },
      include: { user: true, room: { include: { hotel: true } } },
    });

    console.log(`📧 Found ${upcomingBookings.length} bookings to remind`);

    // TODO: Send email reminders using Nodemailer
    for (const booking of upcomingBookings) {
      console.log(
        `📧 Reminder for ${booking.user.email} - Check-in at ${booking.room.hotel.name}`
      );
    }

    console.log('✅ Reminder job completed');
  } catch (error) {
    console.error('❌ Error sending reminders:', error);
  }
}
