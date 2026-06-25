import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salonsAPI, servicesAPI, staffAPI, bookingsAPI } from '../api';
import Navbar from '../components/Navbar';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = ['Service', 'Stylist', 'Date & Time', 'Confirm'];

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center mb-10">
    {STEPS.map((label, idx) => {
      const stepNum = idx + 1;
      const isCompleted = currentStep > stepNum;
      const isCurrent = currentStep === stepNum;
      return (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                  ? 'bg-gradient-brand text-white shadow-brand'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {isCompleted ? '✓' : stepNum}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium hidden sm:block ${
                isCurrent ? 'text-violet-300' : isCompleted ? 'text-emerald-400' : 'text-white/30'
              }`}
            >
              {label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-px mx-2 mb-4 transition-all duration-300 ${
                currentStep > stepNum ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Step 1: Service Selection ────────────────────────────────────────────────

const ServiceStep = ({ salonId, selected, onSelect }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['services', salonId],
    queryFn: () => servicesAPI.getBySalon(salonId),
  });

  const services = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.length === 0 ? (
        <div className="text-center py-12 text-white/40">No services available at this salon.</div>
      ) : (
        services.map((service) => (
          <button
            key={service._id}
            id={`service-${service._id}`}
            onClick={() => onSelect(service)}
            className={`w-full text-left p-5 rounded-xl border transition-all duration-200 ${
              selected?._id === service._id
                ? 'border-violet-500/60 bg-violet-500/15 shadow-brand'
                : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{service.name}</div>
                <div className="text-white/50 text-sm mt-0.5">{service.durationMinutes} minutes · {service.category}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">₹{service.price}</div>
                {selected?._id === service._id && (
                  <div className="text-emerald-400 text-xs mt-0.5">Selected ✓</div>
                )}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
};

// ─── Step 2: Staff Selection ──────────────────────────────────────────────────

const StaffStep = ({ salonId, selected, onSelect }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['staff', salonId],
    queryFn: () => staffAPI.getBySalon(salonId),
  });

  const staff = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-36 skeleton rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {staff.map((member) => (
        <button
          key={member._id}
          id={`staff-${member._id}`}
          onClick={() => onSelect(member)}
          className={`p-4 rounded-xl border text-center transition-all duration-200 ${
            selected?._id === member._id
              ? 'border-violet-500/60 bg-violet-500/15 shadow-brand'
              : 'border-white/10 bg-white/3 hover:border-white/20'
          }`}
        >
          <div className="w-14 h-14 rounded-full mx-auto mb-3 overflow-hidden">
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg">
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-white font-medium text-sm">{member.name}</div>
          {selected?._id === member._id && (
            <div className="text-emerald-400 text-xs mt-1">Selected ✓</div>
          )}
        </button>
      ))}
    </div>
  );
};

// ─── Step 3: Date & Time ──────────────────────────────────────────────────────

const DateTimeStep = ({ salonId, serviceId, staffId, selectedDate, selectedSlot, onDateChange, onSlotSelect }) => {
  const today = new Date().toLocaleDateString('sv-SE');

  const { data, isLoading, error } = useQuery({
    queryKey: ['availability', salonId, serviceId, staffId, selectedDate],
    queryFn: () =>
      bookingsAPI.getAvailability(salonId, { serviceId, staffId, date: selectedDate }),
    enabled: !!selectedDate && !!serviceId && !!staffId,
  });

  const slots = data?.data?.slots || [];

  return (
    <div className="space-y-6">
      <div>
        <label className="form-label">Select Date</label>
        <input
          id="booking-date"
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {selectedDate && (
        <div>
          <label className="form-label">
            Available Time Slots
            {isLoading && <span className="text-white/30 font-normal ml-2">Loading…</span>}
          </label>

          {error && (
            <p className="text-red-400 text-sm">Failed to load availability. Please try again.</p>
          )}

          {!isLoading && slots.length === 0 && !error && (
            <div className="text-center py-10 text-white/40">
              <div className="text-4xl mb-2">📅</div>
              <p>No available slots on this date.<br />Please try a different day.</p>
            </div>
          )}

          {slots.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {slots.map((slot) => (
                <button
                  key={slot}
                  id={`slot-${slot.replace(':', '')}`}
                  onClick={() => onSlotSelect(slot)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 ${
                    selectedSlot === slot
                      ? 'bg-violet-500/30 border-violet-500 text-violet-200 shadow-brand'
                      : 'border-white/15 text-white/70 hover:border-violet-500/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Step 4: Confirmation ─────────────────────────────────────────────────────

const ConfirmStep = ({ salon, service, staff, date, startTime, notes, onNotesChange }) => (
  <div className="space-y-4">
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-white font-semibold text-lg border-b border-white/10 pb-3">Booking Summary</h3>
      {[
        { label: 'Salon', value: salon?.name },
        { label: 'Service', value: `${service?.name} (${service?.durationMinutes} min)` },
        { label: 'Stylist', value: staff?.name },
        { label: 'Date', value: new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
        { label: 'Time', value: startTime },
        { label: 'Amount', value: `₹${service?.price}` },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between items-start">
          <span className="text-white/50 text-sm">{label}</span>
          <span className="text-white text-sm font-medium text-right ml-4 max-w-xs">{value}</span>
        </div>
      ))}
    </div>

    <div>
      <label className="form-label">Special notes (optional)</label>
      <textarea
        id="booking-notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Any special requests or preferences…"
        rows={3}
        className="input-field resize-none"
      />
    </div>

    <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-2">
      <span className="mt-0.5">⚠️</span>
      <span>Cancellations must be made at least 2 hours before your appointment. No-shows may be charged.</span>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const { data: salonRes } = useQuery({
    queryKey: ['salon', id],
    queryFn: () => salonsAPI.getOne(id),
  });
  const salon = salonRes?.data?.data;

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: (data) => bookingsAPI.create(data),
    onSuccess: (res) => {
      setCreatedBooking(res.data.data);
      setIsPaymentOpen(true);
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Booking failed. Please try again.', 'error');
    },
  });

  const { mutate: payBooking, isPending: isPaying } = useMutation({
    mutationFn: ({ bookingId, paymentMethod }) => bookingsAPI.pay(bookingId, { paymentMethod }),
    onSuccess: () => {
      addToast('Payment verified & Booking Confirmed! 🎉', 'success');
      queryClient.invalidateQueries(['bookings-me']);
      setIsPaymentOpen(false);
      navigate('/dashboard');
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Payment verification failed.', 'error');
    },
  });

  const canProceed = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedStaff;
    if (step === 3) return !!selectedDate && !!selectedSlot;
    return true;
  };

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleConfirm = () => {
    createBooking({
      salonId: id,
      serviceId: selectedService._id,
      staffId: selectedStaff._id,
      date: selectedDate,
      startTime: selectedSlot,
      notes,
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(''); // reset slot when date changes
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/salons/${id}`}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors mb-4"
          >
            ← Back to {salon?.name || 'salon'}
          </Link>
          <h1 className="text-2xl font-bold text-white">Book Appointment</h1>
          {salon && <p className="text-white/50 text-sm mt-1">{salon.name} · {salon.city}</p>}
        </div>

        <StepIndicator currentStep={step} />

        {/* Step content */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-6">
            {step === 1 && '1. Choose a Service'}
            {step === 2 && '2. Choose Your Stylist'}
            {step === 3 && '3. Pick a Date & Time'}
            {step === 4 && '4. Confirm Booking'}
          </h2>

          {step === 1 && (
            <ServiceStep
              salonId={id}
              selected={selectedService}
              onSelect={(s) => { setSelectedService(s); }}
            />
          )}
          {step === 2 && (
            <StaffStep
              salonId={id}
              selected={selectedStaff}
              onSelect={(s) => { setSelectedStaff(s); }}
            />
          )}
          {step === 3 && (
            <DateTimeStep
              salonId={id}
              serviceId={selectedService?._id}
              staffId={selectedStaff?._id}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onDateChange={handleDateChange}
              onSlotSelect={setSelectedSlot}
            />
          )}
          {step === 4 && (
            <ConfirmStep
              salon={salon}
              service={selectedService}
              staff={selectedStaff}
              date={selectedDate}
              startTime={selectedSlot}
              notes={notes}
              onNotesChange={setNotes}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={handleBack} className="btn-secondary flex-1 py-3.5">
              ← Back
            </button>
          )}
          {step < 4 ? (
            <button
              id="next-step"
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary flex-1 py-3.5"
            >
              Continue →
            </button>
          ) : (
            <button
              id="confirm-booking"
              onClick={handleConfirm}
              disabled={isPending}
              className="btn-primary flex-1 py-3.5 text-base"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Confirming…
                </>
              ) : (
                'Confirm Booking 🎉'
              )}
            </button>
          )}
        </div>
      </div>
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          addToast('Booking created! It will remain pending until payment is complete.', 'warning');
          navigate('/dashboard');
        }}
        booking={createdBooking}
        onSuccess={(method) => {
          payBooking({ bookingId: createdBooking._id, paymentMethod: method });
        }}
        isPending={isPaying}
      />
    </div>
  );
}
