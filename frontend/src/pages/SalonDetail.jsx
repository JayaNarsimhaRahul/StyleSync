import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { salonsAPI, servicesAPI, staffAPI, reviewsAPI } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StarRating = ({ rating, size = 'sm' }) => {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${sz} ${Math.round(rating) >= s ? 'text-gold-400' : 'text-white/20'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const CATEGORY_LABELS = {
  haircut: 'Haircut', coloring: 'Coloring', styling: 'Styling', treatment: 'Treatment',
  beard: 'Beard', facial: 'Facial', nails: 'Nails', massage: 'Massage', other: 'Other',
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SalonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  const { data: salonRes, isLoading: loadingSalon } = useQuery({
    queryKey: ['salon', id],
    queryFn: () => salonsAPI.getOne(id),
  });

  const { data: staffRes } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffAPI.getBySalon(id),
  });

  const { data: reviewsRes } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsAPI.getBySalon(id),
  });

  const salon = salonRes?.data?.data;
  const services = salon?.services || [];
  const staff = staffRes?.data?.data || [];
  const reviews = reviewsRes?.data?.data || [];
  const images = salon?.images || [];

  if (loadingSalon) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-80 skeleton rounded-2xl mb-8" />
          <div className="h-8 skeleton w-1/3 mb-4" />
          <div className="h-4 skeleton w-2/3" />
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-white text-xl font-semibold mb-2">Salon not found</h2>
          <Link to="/salons" className="btn-primary">Browse Salons</Link>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/salons/${id}/book`);
      return;
    }
    navigate(`/salons/${id}/book`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Gallery ── */}
      <section className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {images.length > 0 && !imgError ? (
            <div className="relative rounded-2xl overflow-hidden h-72 sm:h-96 bg-surface-800">
              <img
                src={images[galleryIndex]}
                alt={salon.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setGalleryIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setGalleryIndex((i) => (i + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setGalleryIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === galleryIndex ? 'bg-white' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-72 sm:h-96 rounded-2xl bg-gradient-to-br from-violet-800/60 to-surface-900 flex items-center justify-center">
              <span className="text-8xl">💈</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Salon Info Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white font-display mb-2">{salon.name}</h1>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {salon.address}, {salon.city}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <StarRating rating={salon.avgRating} size="lg" />
                    <span className="text-white font-bold ml-1">{salon.avgRating?.toFixed(1) || '—'}</span>
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">{salon.totalReviews} reviews</div>
                </div>
              </div>
            </div>

            {salon.description && (
              <p className="text-white/60 leading-relaxed mb-6">{salon.description}</p>
            )}

            {/* Book Now CTA — sticky on mobile */}
            <div className="lg:hidden">
              <button
                id="book-now-mobile"
                onClick={handleBookNow}
                className="btn-primary w-full py-4 text-base"
              >
                Book Appointment
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Opening Hours summary */}
            <div className="glass-card p-4 mt-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>🕐</span> Opening Hours
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const hours = salon.openingHours?.[day];
                  return (
                    <div key={day} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                      <span className="text-white/50 capitalize">{day.slice(0, 3)}</span>
                      <span className={hours?.isClosed ? 'text-red-400' : 'text-white/80'}>
                        {hours?.isClosed ? 'Closed' : `${hours?.open || '09:00'} – ${hours?.close || '18:00'}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Book Now card (desktop) */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="glass-card p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-1">
                  {services.length > 0
                    ? `From ₹${Math.min(...services.map((s) => s.price))}`
                    : 'Book Now'}
                </div>
                <div className="text-white/40 text-sm">{services.length} services available</div>
              </div>
              <button
                id="book-now-desktop"
                onClick={handleBookNow}
                className="btn-primary w-full py-4 text-base mb-3"
              >
                Book Appointment
              </button>
              {!isAuthenticated && (
                <p className="text-center text-white/40 text-xs">
                  You'll be asked to log in or create an account
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-10">
          <div className="flex border-b border-white/10 gap-1 mb-8">
            {[
              { id: 'services', label: `Services (${services.length})` },
              { id: 'staff', label: `Our Team (${staff.length})` },
              { id: 'reviews', label: `Reviews (${salon.totalReviews || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-300'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-white/40">No services listed yet.</div>
              ) : (
                services.map((service) => (
                  <div key={service._id} className="glass-card p-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-violet text-xs">{CATEGORY_LABELS[service.category] || service.category}</span>
                      </div>
                      <h3 className="text-white font-semibold">{service.name}</h3>
                      <p className="text-white/40 text-sm mt-0.5">{service.durationMinutes} min</p>
                      {service.description && (
                        <p className="text-white/50 text-xs mt-1 line-clamp-2">{service.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-white">₹{service.price}</div>
                      <button
                        onClick={handleBookNow}
                        className="text-violet-400 text-xs hover:text-violet-300 transition-colors mt-1"
                      >
                        Book →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-white/40">No staff listed yet.</div>
              ) : (
                staff.map((member) => (
                  <div key={member._id} className="glass-card p-5 text-center hover:border-violet-500/30 transition-all duration-300">
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-2">{member.name}</h3>
                    {member.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {member.specialties.map((s) => (
                          <span key={s} className="badge-violet text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-white/40">No reviews yet. Be the first!</div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {review.customerId?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm">{review.customerId?.name}</div>
                        <div className="text-white/40 text-xs">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
