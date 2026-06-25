/**
 * slotEngine.js — Real-time appointment slot availability calculator
 *
 * ALGORITHM:
 *  1. Convert the salon's opening window for that weekday into minute offsets
 *  2. Clamp against the staff member's working hours for that day
 *  3. Generate candidate slots on a fixed grid (SLOT_INTERVAL_MIN)
 *  4. Filter out:
 *     a) Slots that end after the effective close time
 *     b) Slots that conflict with any existing non-cancelled booking for the staff on that date
 *     c) Slots in the past when the date is today
 *  5. Return surviving slots as "HH:MM" strings
 *
 * TIME MODEL:
 *  - All times stored/compared as total minutes since midnight (0–1439)
 *  - Bookings with status 'cancelled' are excluded from conflict checks
 *  - 'pending' bookings DO block the slot (prevents double-booking before confirmation)
 *  - No timezone handling in v1 — all times are treated as local salon time
 */

const SLOT_INTERVAL_MIN = 30; // 30-minute grid

/**
 * Convert "HH:MM" string to total minutes since midnight.
 * @param {string} timeStr — e.g. "09:30"
 * @returns {number} — e.g. 570
 */
const toMinutes = (timeStr) => {
  const [hh, mm] = timeStr.split(':').map(Number);
  return hh * 60 + mm;
};

/**
 * Convert total minutes since midnight back to "HH:MM" string.
 * @param {number} mins
 * @returns {string}
 */
const toTimeStr = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Map a JS Date's day-of-week index to the Salon.openingHours key.
 */
const DAY_MAP = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Check if two time intervals overlap.
 * Intervals are half-open: [start, end)
 *
 * Overlap exists unless: slotEnd <= bookingStart OR slotStart >= bookingEnd
 */
const overlaps = (slotStart, slotEnd, bookingStart, bookingEnd) => {
  return !(slotEnd <= bookingStart || slotStart >= bookingEnd);
};

/**
 * Compute available slots for a given staff member on a given date.
 *
 * @param {Object} options
 * @param {Object} options.salon           — Mongoose Salon document (has openingHours)
 * @param {Object} options.staff           — Mongoose Staff document (has workingHours)
 * @param {number} options.durationMinutes — Service duration in minutes
 * @param {string} options.date            — "YYYY-MM-DD" date string
 * @param {Array}  options.existingBookings — Non-cancelled Booking documents for (staffId, date)
 *
 * @returns {string[]} — Array of "HH:MM" slot start times that are available
 */
const computeAvailableSlots = ({ salon, staff, durationMinutes, date, existingBookings }) => {
  // ── 1. Determine the salon's effective hours for this weekday ──────────────
  const dateObj = new Date(date + 'T00:00:00'); // parse as local date
  const dayName = DAY_MAP[dateObj.getDay()];
  const dayHours = salon.openingHours?.[dayName];

  if (!dayHours || dayHours.isClosed) {
    return []; // Salon is closed on this day
  }

  let effectiveOpen = toMinutes(dayHours.open || '09:00');
  let effectiveClose = toMinutes(dayHours.close || '18:00');

  // ── 2. Clamp against staff working hours for this day ─────────────────────
  // Staff.workingHours is an Array of {day, start, end, isOff} — find by day name
  if (staff.workingHours && Array.isArray(staff.workingHours)) {
    const staffDay = staff.workingHours.find((wh) => wh.day === dayName);
    if (!staffDay || staffDay.isOff) {
      return []; // Staff is not working this day
    }
    if (staffDay.start) effectiveOpen = Math.max(effectiveOpen, toMinutes(staffDay.start));
    if (staffDay.end) effectiveClose = Math.min(effectiveClose, toMinutes(staffDay.end));
  }

  if (effectiveOpen >= effectiveClose) {
    return []; // Invalid window
  }

  // ── 3. Parse existing bookings into minute ranges ─────────────────────────
  const bookedRanges = existingBookings.map((b) => ({
    start: toMinutes(b.startTime),
    end: toMinutes(b.endTime),
  }));

  // ── 4. Determine "now" in minutes if booking date is today ────────────────
  const today = new Date().toLocaleDateString('sv-SE');
  const isToday = date === today;
  const nowMinutes = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : 0;

  // ── 5. Generate and filter candidate slots ────────────────────────────────
  const available = [];

  for (
    let slotStart = effectiveOpen;
    slotStart + durationMinutes <= effectiveClose;
    slotStart += SLOT_INTERVAL_MIN
  ) {
    const slotEnd = slotStart + durationMinutes;

    // Reject slots in the past (add 30-min buffer so people can't book immediate slots)
    if (isToday && slotStart <= nowMinutes + 30) continue;

    // Reject if slot conflicts with any existing booking
    const hasConflict = bookedRanges.some(({ start, end }) =>
      overlaps(slotStart, slotEnd, start, end)
    );

    if (!hasConflict) {
      available.push(toTimeStr(slotStart));
    }
  }

  return available;
};

module.exports = { computeAvailableSlots, toMinutes, toTimeStr, DAY_MAP };
