import cron from 'node-cron';
import { updateBookingStatuses } from './updateStatuses';
import { sendReminder } from './sendReminder';

/**
 * Initialize all background jobs
 * Add your cron schedules here
 */
export function initializeJobs() {
  console.log('🚀 Initializing background jobs...');

  // Run every day at 00:00
  cron.schedule('0 0 * * *', updateBookingStatuses);
  console.log('✅ Job scheduled: Update booking statuses (Daily at 00:00)');

  // Run every day at 08:00 (send reminders in the morning)
  cron.schedule('0 8 * * *', sendReminder);
  console.log('✅ Job scheduled: Send booking reminders (Daily at 08:00)');
}
