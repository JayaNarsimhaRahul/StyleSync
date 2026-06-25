import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingsAPI } from '../api';

const TABS = ['upcoming', 'past', 'cancelled'];
const TAB_LABELS = { upcoming: 'Upcoming', past: 'Past', cancelled: 'Cancelled' };

const STATUS_COLORS = {
  confirmed: 'badge-green',
  completed: 'badge-violet',
  cancelled: 'text-red-400 border border-red-500/30 bg-red-500/10',
  pending: 'badge-gold',
  no_show: 'text-white/40 border border-white/10 bg-white/5',
};

const BookingCard = ({ booking, onCancel, onPay }) => {
  const [confirming, setConfirming] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isUpcoming = ['confirmed', 'pending'].includes(booking.status);
  const dateObj = new Date(booking.date + 'T00:00:00');

  return (
    <div className="glass-card p-5 hover:border-violet-500/20 transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Salon image */}
        <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden shrink-0">
          {booking.salonId?.images?.[0] && !imgError ? (
            <img 
              src={booking.salonId.images[0]} 
              alt={booking.salonId.name} 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-800/60 to-surface-900 flex items-center justify-center">
              <span className="text-2xl">💈</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <Link
                to={`/salons/${booking.salonId?._id}`}
                className="text-white font-semibold hover:text-violet-300 transition-colors"
              >
                {booking.salonId?.name}
              </Link>
              <div className="text-white/50 text-sm mt-0.5">{booking.salonId?.city}</div>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_COLORS[booking.status] || 'badge-violet'}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm mb-3">
            <div>
              <span className="text-white/40">Service</span>
              <div className="text-white font-medium">{booking.serviceId?.name}</div>
            </div>
            <div>
              <span className="text-white/40">Stylist</span>
              <div className="text-white font-medium">{booking.staffId?.name}</div>
            </div>
            <div>
              <span className="text-white/40">Date & Time</span>
              <div className="text-white font-medium">
                {dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {booking.startTime}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gold-400 font-semibold">₹{booking.amount}</span>
            <div className="flex gap-2">
              {booking.status === 'completed' && (
                <Link
                  to={`/review/${booking._id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Leave Review
                </Link>
              )}
              {isUpcoming && (
                <>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => onPay(booking)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors bg-emerald-500/5 font-semibold mr-1.5"
                    >
                      Pay Now 💳
                    </button>
                  )}
                  {!confirming ? (
                    <button
                      onClick={() => setConfirming(true)}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <span className="text-white/50 text-xs">Sure?</span>
                      <button
                        onClick={() => { onCancel(booking._id); setConfirming(false); }}
                        className="text-xs text-red-400 font-semibold border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Yes, Cancel
                      </button>
                      <button
                        onClick={() => setConfirming(false)}
                        className="text-xs text-white/50 hover:text-white"
                      >
                        No
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data, isLoading } = useQuery({
    queryKey: ['bookings-me'],
    queryFn: () => bookingsAPI.myBookings(),
  });

  const { mutate: cancelBooking } = useMutation({
    mutationFn: (id) => bookingsAPI.cancel(id, ''),
    onSuccess: () => {
      addToast('Booking cancelled successfully.', 'success');
      queryClient.invalidateQueries(['bookings-me']);
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Could not cancel booking.', 'error');
    },
  });

  const [selectedBookingForPay, setSelectedBookingForPay] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const { mutate: payBooking, isPending: isPaying } = useMutation({
    mutationFn: ({ bookingId, paymentMethod }) => bookingsAPI.pay(bookingId, { paymentMethod }),
    onSuccess: () => {
      addToast('Payment verified & Booking Confirmed! 🎉', 'success');
      queryClient.invalidateQueries(['bookings-me']);
      setIsPaymentOpen(false);
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Payment verification failed.', 'error');
    },
  });

  const allBookings = data?.data?.data || [];

  const now = new Date();
  const filteredBookings = allBookings.filter((b) => {
    const bookingDate = new Date(b.date + 'T' + (b.endTime || '23:59'));
    if (activeTab === 'upcoming') return ['confirmed', 'pending'].includes(b.status) && bookingDate >= now;
    if (activeTab === 'past') return b.status === 'completed' || (bookingDate < now && b.status !== 'cancelled');
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const stats = {
    total: allBookings.length,
    completed: allBookings.filter((b) => b.status === 'completed').length,
    upcoming: allBookings.filter((b) => ['confirmed', 'pending'].includes(b.status)).length,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-2xl shadow-brand">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Hi, {user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-white/50 text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-white/40 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-4 py-2 rounded-xl transition-all"
          >
            Log out
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Bookings', value: stats.total, icon: '📅' },
            { label: 'Completed', value: stats.completed, icon: '✅' },
            { label: 'Upcoming', value: stats.upcoming, icon: '⏰' },
            { label: 'Phone', value: user?.phone || '—', icon: '📱' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="glass-card overflow-hidden">
          <div className="flex border-b border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-violet-500 text-violet-300'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {activeTab === 'upcoming' ? 'No upcoming appointments' : activeTab === 'past' ? 'No past bookings' : 'No cancelled bookings'}
                </h3>
                {activeTab === 'upcoming' && (
                  <>
                    <p className="text-white/40 text-sm mb-6">Book your next appointment to get started.</p>
                    <Link to="/salons" className="btn-primary px-6 py-2.5 text-sm">
                      Find a Salon
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((b) => (
                  <BookingCard
                    key={b._id}
                    booking={b}
                    onCancel={cancelBooking}
                    onPay={(booking) => {
                      setSelectedBookingForPay(booking);
                      setIsPaymentOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        booking={selectedBookingForPay}
        onSuccess={(method) => {
          payBooking({ bookingId: selectedBookingForPay._id, paymentMethod: method });
        }}
        isPending={isPaying}
      />
    </div>
  );
}
