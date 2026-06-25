/**
 * StyleSync Simulated Email Utility
 * Prints beautifully formatted terminal boxes representing sent emails.
 * Avoids setting up SMTP/Nodemailer for simple developer/beginner testing.
 */

const sendSimulatedEmail = ({ type, booking, user }) => {
  const customerName = booking.customerId?.name || user?.name || 'Valued Customer';
  const customerEmail = booking.customerId?.email || user?.email || 'customer@example.com';
  const salonName = booking.salonId?.name || 'StyleSync Salon';
  const serviceName = booking.serviceId?.name || 'Salon Service';
  const stylistName = booking.staffId?.name || 'Stylist';
  const bookingDate = booking.date;
  const bookingTime = booking.startTime;
  const amountPaid = booking.amount;
  const transactionId = booking.transactionId || 'MOCK_TXN_ID';

  let subject = '';
  let headerColor = '\x1b[35m'; // Purple/Magenta for confirmations
  let content = '';

  if (type === 'booking_confirmed') {
    subject = `Booking Confirmed at ${salonName}! 🎉`;
    content = `
  Hi ${customerName},

  Your appointment at \x1b[1m${salonName}\x1b[22m is confirmed!

  \x1b[36mAppointment Summary:\x1b[39m
  ----------------------------------------
  ✂️  Service:     ${serviceName}
  👥  Stylist:     ${stylistName}
  📅  Date:        ${bookingDate}
  ⏰  Time:        ${bookingTime}
  💰  Paid:        ₹${amountPaid} via Simulated Checkout
  🆔  Txn ID:      ${transactionId}
  ----------------------------------------

  Address: ${booking.salonId?.address || ''}, ${booking.salonId?.city || ''}

  Need to reschedule or cancel? You can manage your booking in your StyleSync dashboard up to 2 hours before the start time.

  Thank you for booking with StyleSync! ✂️✨
    `;
  } else if (type === 'booking_cancelled') {
    subject = `Appointment Cancelled — ${salonName}`;
    headerColor = '\x1b[31m'; // Red for cancellation
    const reason = booking.cancellationReason ? `Reason: ${booking.cancellationReason}` : 'No reason provided';
    content = `
  Hi ${customerName},

  This is to confirm that your appointment at \x1b[1m${salonName}\x1b[22m has been cancelled.

  Cancelled Appointment Details:
  ----------------------------------------
  ✂️  Service:     ${serviceName}
  👥  Stylist:     ${stylistName}
  📅  Date:        ${bookingDate}
  ⏰  Time:        ${bookingTime}
  ❌  Refund:      ₹${amountPaid} will be simulated-refunded if applicable.
  ❗  ${reason}
  ----------------------------------------

  We hope to sync with you again soon!

  Best regards,
  The ${salonName} Team
    `;
  } else if (type === 'booking_reminder') {
    subject = `Reminder: Upcoming Appointment at ${salonName} in 2 Hours! ⏰`;
    headerColor = '\x1b[33m'; // Gold/Yellow for reminder
    content = `
  Hi ${customerName},

  This is a friendly reminder that you have an upcoming appointment at \x1b[1m${salonName}\x1b[22m starting in 2 hours!

  Appointment Details:
  ----------------------------------------
  ✂️  Service:     ${serviceName}
  👥  Stylist:     ${stylistName}
  📅  Date:        ${bookingDate}
  ⏰  Time:        ${bookingTime}
  ----------------------------------------

  We look forward to seeing you! Please arrive 10 minutes early.

  Best regards,
  The StyleSync Team
    `;
  }

  // Draw simulated email terminal wrapper
  console.log(`\n`);
  console.log(`\x1b[1m\x1b[47m\x1b[30m 📧 OUTBOUND SIMULATED EMAIL \x1b[0m`);
  console.log(`\x1b[1mTo:\x1b[22m ${customerEmail}`);
  console.log(`\x1b[1mSubject:\x1b[22m ${headerColor}${subject}\x1b[0m`);
  console.log(`+--------------------------------------------------------------+`);
  console.log(content.trim().split('\n').map(line => `| ${line.padEnd(60)} |`).join('\n'));
  console.log(`+--------------------------------------------------------------+`);
  console.log(`\n`);
};

module.exports = { sendSimulatedEmail };
