import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Data ────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: '🔍',
    title: 'Discover Top Salons',
    desc: 'Browse curated salons near you filtered by services, ratings, and price.',
  },
  {
    icon: '📅',
    title: 'Real-Time Booking',
    desc: 'See live available slots and book in under 60 seconds — no phone calls.',
  },
  {
    icon: '✨',
    title: 'Expert Stylists',
    desc: 'Choose your preferred stylist and view their specialties and past work.',
  },
  {
    icon: '🔔',
    title: 'Smart Reminders',
    desc: 'Get email reminders before your appointment so you never miss a session.',
  },
  {
    icon: '⭐',
    title: 'Verified Reviews',
    desc: 'Reviews are only from customers who actually visited — no fake ratings.',
  },
  {
    icon: '💳',
    title: 'Secure Payments',
    desc: 'Pay your deposit online with Razorpay. Fully encrypted and secure.',
  },
];

const steps = [
  { step: '01', title: 'Find a Salon', desc: 'Search by city, service, or rating.' },
  { step: '02', title: 'Pick a Slot', desc: 'Choose your stylist, date, and time.' },
  { step: '03', title: 'Confirm & Pay', desc: 'Lock your spot with a secure deposit.' },
  { step: '04', title: 'Show Up & Shine', desc: 'Walk in, relax, and look amazing.' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Regular Customer',
    avatar: 'PS',
    text: "StyleSync made booking so easy! I found my go-to stylist in 2 minutes and haven't looked back since.",
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Salon Owner',
    avatar: 'RM',
    text: "My bookings increased 3x after joining StyleSync. The dashboard is brilliant — I can see everything at a glance.",
    rating: 5,
  },
  {
    name: 'Anjali Nair',
    role: 'Regular Customer',
    avatar: 'AN',
    text: "Love the reminder emails! I used to forget appointments. No more embarrassing no-shows.",
    rating: 5,
  },
];

const featuredSalons = [
  {
    name: 'The Velvet Chair',
    city: 'Mumbai',
    rating: 4.9,
    reviews: 312,
    services: ['Hair', 'Beard', 'Facial'],
    badge: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
    emoji: '💈',
  },
  {
    name: 'Aura Beauty Studio',
    city: 'Delhi',
    rating: 4.8,
    reviews: 278,
    services: ['Coloring', 'Styling', 'Nails'],
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600&auto=format&fit=crop',
    emoji: '💅',
  },
  {
    name: 'Crown & Glow',
    city: 'Bangalore',
    rating: 4.7,
    reviews: 195,
    services: ['Hair', 'Treatment', 'Massage'],
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop',
    emoji: '👑',
  },
];

const genderStyles = {
  men: [
    {
      name: 'Textured Fade Crop',
      desc: 'A modern low-maintenance crop haircut combined with a clean skin fade on the sides. Ideal for a sharp, clean-cut daily look.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop',
      tag: 'Trending',
      price: '₹500 - ₹900',
      duration: '30 mins',
    },
    {
      name: 'Classic Pompadour',
      desc: 'Sleek, high-volume styled top with tapered or faded sides. Styled with premium pomade for a refined and sophisticated finish.',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop',
      tag: 'Classic',
      price: '₹600 - ₹1200',
      duration: '40 mins',
    },
    {
      name: 'Royal Beard Sculpt',
      desc: 'Precision beard shaping with razor outlining, finished with oil massage and a relaxing steam hot towel treatment.',
      image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600&auto=format&fit=crop',
      tag: 'Grooming',
      price: '₹350 - ₹600',
      duration: '30 mins',
    },
  ],
  women: [
    {
      name: 'Balayage & Soft Waves',
      desc: 'Hand-painted premium highlights blending seamlessly into natural hair tones, styled with soft, voluminous curls.',
      image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?q=80&w=600&auto=format&fit=crop',
      tag: 'Popular',
      price: '₹2800 - ₹5000',
      duration: '120 mins',
    },
    {
      name: 'Precision Bob Cut',
      desc: 'A sleek, straight bob or long bob cut to perfection. Creates a modern, high-fashion frame for your face.',
      image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?q=80&w=600&auto=format&fit=crop',
      tag: 'Modern',
      price: '₹900 - ₹1800',
      duration: '45 mins',
    },
    {
      name: 'Premium Hair Coloring',
      desc: 'Full-head organic hair dye with a gloss coat to give your hair a brilliant, shiny, and vibrant color reflection.',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop',
      tag: 'Coloring',
      price: '₹2200 - ₹4000',
      duration: '90 mins',
    },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-gold-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const FeaturedSalonCard = ({ salon }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <Link to="/salons" className="salon-card group">
      {/* Image or distinct placeholder */}
      <div className="h-48 relative overflow-hidden rounded-t-2xl">
        {salon.image && !imgError ? (
          <img
            src={salon.image}
            alt={salon.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-800/60 to-surface-900 flex items-center justify-center">
            <span className="text-6xl">{salon.emoji || '💈'}</span>
          </div>
        )}
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="badge-violet text-xs">{salon.badge}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-violet-300 transition-colors">{salon.name}</h3>
          <div className="flex items-center gap-1 text-sm text-white/70 shrink-0 ml-2">
            <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium text-white">{salon.rating}</span>
            <span className="text-white/40">({salon.reviews})</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/50 text-sm mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {salon.city}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {salon.services.map((s) => (
            <span key={s} className="badge-violet text-xs">{s}</span>
          ))}
        </div>
      </div>
    </Link>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeGender, setActiveGender] = useState('men');
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-violet-300 font-medium">Now live in 50+ cities across India</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
              Your Next{' '}
              <span className="gradient-text italic">Great Look</span>
              <br />
              Is One Click Away
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Discover top-rated salons, book real-time appointment slots, and walk in without the wait.
              StyleSync is the smarter way to look your best.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/salons" className="btn-primary text-base px-8 py-4">
                Find a Salon Near You
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/register?role=owner" className="btn-secondary text-base px-8 py-4">
                List Your Salon
              </Link>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {[
                { label: 'Salons', value: '2,400+' },
                { label: 'Happy Customers', value: '48K+' },
                { label: 'Avg Rating', value: '4.8 ★' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-950 to-transparent pointer-events-none" />
      </section>

      {/* ── Featured Salons ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-2">Handpicked for you</p>
              <h2 className="section-title">Featured Salons</h2>
            </div>
            <Link to="/salons" className="btn-secondary text-sm px-5 py-2.5 hidden sm:flex">
              View all salons →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSalons.map((salon) => (
              <FeaturedSalonCard key={salon.name} salon={salon} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Styles (Men & Women) ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-2">Style Inspiration</p>
            <h2 className="section-title mb-4">Find Your Signature Style</h2>
            <p className="text-white/60 text-base max-w-xl mx-auto">
              Explore curated styling trends tailored for both men and women. Get inspired and lock in your favorite look.
            </p>

            {/* Gender Toggle Tabs */}
            <div className="flex justify-center mt-8">
              <div className="glass-card p-1.5 flex gap-2 rounded-full border border-white/10 bg-surface-900/50">
                <button
                  onClick={() => setActiveGender('men')}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    activeGender === 'men'
                      ? 'bg-gradient-brand text-white shadow-brand'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ♂ Men's Grooming
                </button>
                <button
                  onClick={() => setActiveGender('women')}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    activeGender === 'women'
                      ? 'bg-gradient-brand text-white shadow-brand'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ♀ Women's Styling
                </button>
              </div>
            </div>
          </div>

          {/* Style Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {genderStyles[activeGender].map((style) => (
              <div key={style.name} className="glass-card group overflow-hidden flex flex-col h-full hover:border-violet-500/30 transition-all duration-300">
                {/* Image Section */}
                <div className="h-64 relative overflow-hidden shrink-0">
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="badge-violet text-xs font-semibold">{style.tag}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-white font-semibold text-xl mb-2 group-hover:text-violet-300 transition-colors">
                    {style.name}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1">
                    {style.desc}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-white/40 text-xs uppercase tracking-wider">Est. Price</span>
                      <span className="text-gold-400 font-bold text-sm">{style.price}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-white/40 text-xs uppercase tracking-wider">Duration</span>
                      <span className="text-white/70 font-semibold text-sm">{style.duration}</span>
                    </div>
                  </div>

                  <Link
                    to={`/salons?search=${encodeURIComponent(style.name.split(' ')[0])}`}
                    className="btn-secondary w-full text-center mt-5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <span>Book This Look</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-2">Simple process</p>
            <h2 className="section-title">How StyleSync Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-violet-500/40 to-transparent z-0" />
                )}
                <div className="glass-card p-6 text-center relative z-10 hover:border-violet-500/30 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-brand">
                    <span className="text-white font-bold text-xl">{step.step}</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-2">Everything you need</p>
            <h2 className="section-title">Built for the Modern Salon Experience</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className="glass-card p-6 hover:border-violet-500/30 transition-all duration-300 group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-2">Real stories</p>
            <h2 className="section-title">What Our Community Says</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.role}</div>
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={t.rating} />
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed italic">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Owner CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-brand opacity-10 pointer-events-none" />
            <div className="relative">
              <span className="text-5xl mb-6 block animate-float">💈</span>
              <h2 className="section-title mb-4">Are You a Salon Owner?</h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                Join 2,400+ salons already on StyleSync. Get more bookings, manage your team, and grow your business — all in one dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register?role=owner" className="btn-gold text-base px-8 py-4">
                  List Your Salon Free →
                </Link>
                <button className="btn-secondary text-base px-8 py-4">
                  See Owner Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
