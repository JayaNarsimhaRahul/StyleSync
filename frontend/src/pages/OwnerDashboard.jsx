import { useState } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ownerAPI, salonsAPI, servicesAPI, staffAPI } from '../api';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '📊', path: '/owner' },
  { id: 'salon', label: 'My Salon', icon: '💈', path: '/owner/salon' },
  { id: 'services', label: 'Services', icon: '✂️', path: '/owner/services' },
  { id: 'staff', label: 'Staff', icon: '👥', path: '/owner/staff' },
  { id: 'bookings', label: 'Bookings', icon: '📅', path: '/owner/bookings' },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const Sidebar = ({ user, logout, sidebarOpen, setSidebarOpen }) => (
  <aside
    className={`fixed inset-y-0 left-0 z-40 w-64 glass-card rounded-none border-r border-white/10 flex flex-col transition-transform duration-300 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}
  >
    <div className="p-6 border-b border-white/10">
      <div className="flex items-center gap-3">
        <Logo showText={false} />
        <div>
          <div className="text-white font-bold font-display">StyleSync</div>
          <div className="text-xs text-violet-400">Owner Dashboard</div>
        </div>
      </div>
    </div>
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          end={item.path === '/owner'}
          id={`nav-${item.id}`}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <div className="text-white text-sm font-medium truncate">{user?.name}</div>
          <div className="text-white/40 text-xs truncate">{user?.email}</div>
        </div>
      </div>
      <button
        id="owner-logout"
        onClick={logout}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Log out
      </button>
    </div>
  </aside>
);

// ─── Overview Page ────────────────────────────────────────────────────────────

const OverviewPage = ({ user }) => {
  const { data: salonRes } = useQuery({ queryKey: ['my-salon'], queryFn: ownerAPI.getMySalon });
  const salon = salonRes?.data?.data;

  const { data: analyticsRes } = useQuery({
    queryKey: ['analytics', salon?._id],
    queryFn: () => ownerAPI.getAnalytics(salon._id),
    enabled: !!salon?._id,
  });
  const analytics = analyticsRes?.data?.data;

  const stats = analytics
    ? [
        { label: 'Total Bookings', value: (analytics.statusBreakdown?.confirmed || 0) + (analytics.statusBreakdown?.completed || 0) + (analytics.statusBreakdown?.pending || 0), icon: '📅' },
        { label: 'Revenue', value: `₹${analytics.revenueSummary?.total?.toLocaleString('en-IN') || 0}`, icon: '💰' },
        { label: 'Avg Rating', value: salon?.avgRating?.toFixed(1) || '—', icon: '⭐' },
        { label: 'Total Reviews', value: salon?.totalReviews || 0, icon: '💬' },
      ]
    : [
        { label: 'Total Bookings', value: '—', icon: '📅' },
        { label: 'Revenue', value: '—', icon: '💰' },
        { label: 'Avg Rating', value: salon?.avgRating?.toFixed(1) || '—', icon: '⭐' },
        { label: 'Total Reviews', value: salon?.totalReviews || 0, icon: '💬' },
      ];

  // Helper values for charts
  const maxRevenue = analytics?.revenueByMonth?.length > 0
    ? Math.max(...analytics.revenueByMonth.map(m => m.revenue))
    : 0;

  const totalStatusBookings = analytics?.statusBreakdown
    ? Object.values(analytics.statusBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  const totalStaffBookings = analytics?.staffUtilization?.length > 0
    ? analytics.staffUtilization.reduce((sum, item) => sum + item.bookings, 0)
    : 0;

  const getMonthName = (year, month) => {
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  const STATUS_BG = {
    completed: 'bg-emerald-500',
    confirmed: 'bg-violet-500',
    pending: 'bg-amber-500',
    cancelled: 'bg-red-500',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Overview</h1>
      <p className="text-white/50 text-sm mb-8">Welcome back, {user?.name?.split(' ')[0]}. Here's your salon at a glance.</p>

      {!salon && (
        <div className="glass-card p-6 mb-8 border-violet-500/30 bg-violet-500/5">
          <h2 className="text-white font-semibold mb-2">🚀 Get Started</h2>
          <p className="text-white/60 text-sm mb-4">You haven't set up your salon yet. Create your salon profile to start accepting bookings.</p>
          <NavLink to="/owner/salon" className="btn-primary text-sm px-5 py-2.5">
            Create My Salon →
          </NavLink>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {analytics && (
        <div className="space-y-6 mb-8">
          {/* Row 1: Revenue Trends & Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-white font-semibold text-base mb-1">Monthly Revenue</h3>
                <p className="text-white/40 text-xs mb-6">Last 6 Months performance trend</p>
              </div>
              
              {analytics.revenueByMonth?.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-white/30 text-sm">No revenue data recorded yet.</div>
              ) : (
                <div className="flex items-end justify-between h-48 px-2 pt-6">
                  {analytics.revenueByMonth.map((m, idx) => {
                    const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-surface-950 border border-white/10 px-2 py-1 rounded text-[10px] text-white font-bold mb-2 absolute translate-y-[-110%] pointer-events-none shadow-lg z-10">
                          ₹{m.revenue.toLocaleString('en-IN')}
                        </div>
                        {/* Bar */}
                        <div 
                          style={{ height: `${Math.max(pct, 6)}%` }} 
                          className="w-8 sm:w-12 bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-brand/20 shadow-lg"
                        />
                        {/* Label */}
                        <span className="text-[10px] text-white/40 font-medium mt-3 uppercase tracking-wider">
                          {getMonthName(m._id.year, m._id.month)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Booking Status Breakdown */}
            <div className="glass-card p-6">
              <h3 className="text-white font-semibold text-base mb-1">Booking Status Breakdown</h3>
              <p className="text-white/40 text-xs mb-6">Distribution of appointments</p>
              
              <div className="space-y-4">
                {['completed', 'confirmed', 'pending', 'cancelled'].map((status) => {
                  const count = analytics.statusBreakdown[status] || 0;
                  const pct = totalStatusBookings > 0 ? (count / totalStatusBookings) * 100 : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60 capitalize font-medium">{status}</span>
                        <span className="text-white/40">{count} bookings ({Math.round(pct)}%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${pct}%` }} 
                          className={`h-full ${STATUS_BG[status] || 'bg-white/30'} rounded-full transition-all duration-500`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Stylist performance & Customer Loyalty */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stylist utilization */}
            <div className="glass-card p-6">
              <h3 className="text-white font-semibold text-base mb-1">Stylist Performance</h3>
              <p className="text-white/40 text-xs mb-6">Total bookings completed by stylist</p>

              {analytics.staffUtilization?.length === 0 ? (
                <div className="py-12 text-center text-white/30 text-sm">No stylists added yet.</div>
              ) : (
                <div className="space-y-4">
                  {analytics.staffUtilization.map((staff, idx) => {
                    const pct = totalStaffBookings > 0 ? (staff.bookings / totalStaffBookings) * 100 : 0;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        {/* Stylist avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                          {staff.photo ? (
                            <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
                          ) : (
                            staff.name.charAt(0)
                          )}
                        </div>
                        {/* Name and progress */}
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-white font-medium">{staff.name}</span>
                            <span className="text-white/40">{staff.bookings} bookings ({Math.round(pct)}%)</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${pct}%` }} 
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer loyalty */}
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-white font-semibold text-base mb-1">Customer loyalty</h3>
                <p className="text-white/40 text-xs mb-6">New vs returning client statistics</p>
              </div>

              {analytics.customerStats?.total === 0 ? (
                <div className="py-12 text-center text-white/30 text-sm">No customer history recorded.</div>
              ) : (
                <div className="space-y-6">
                  {/* Segmented bar */}
                  <div className="space-y-1">
                    <div className="w-full h-4 rounded-lg overflow-hidden flex bg-white/5">
                      <div 
                        style={{ width: `${(analytics.customerStats.newCustomers / analytics.customerStats.total) * 100}%` }} 
                        className="bg-violet-600 h-full transition-all duration-500"
                        title="New Customers"
                      />
                      <div 
                        style={{ width: `${(analytics.customerStats.returning / analytics.customerStats.total) * 100}%` }} 
                        className="bg-gold-500 h-full transition-all duration-500"
                        title="Returning Customers"
                      />
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-600 block" />
                        <span className="text-white/60 text-xs font-semibold">New Clients</span>
                      </div>
                      <div className="text-white font-bold text-lg">{analytics.customerStats.newCustomers}</div>
                      <span className="text-[10px] text-white/40">{Math.round((analytics.customerStats.newCustomers / analytics.customerStats.total) * 100)}% of total clients</span>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-gold-500 block" />
                        <span className="text-white/60 text-xs font-semibold">Returning Clients</span>
                      </div>
                      <div className="text-white font-bold text-lg">{analytics.customerStats.returning}</div>
                      <span className="text-[10px] text-white/40">{Math.round((analytics.customerStats.returning / analytics.customerStats.total) * 100)}% of total clients</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Services (Bottom Grid) */}
      {analytics?.topServices?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 text-base">🔥 Top Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.topServices.map((s, idx) => (
              <div key={s.serviceId} className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl hover:border-violet-500/20 transition-all duration-200">
                <div>
                  <div className="text-white text-sm font-semibold flex items-center gap-2">
                    <span className="text-white/40 text-xs font-bold">#{idx + 1}</span>
                    {s.name}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5 capitalize">{s.count} bookings · {s.category}</div>
                </div>
                <div className="text-gold-400 font-bold text-base">₹{s.revenue?.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Salon Profile Page ───────────────────────────────────────────────────────

const salonSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  address: z.string().min(3),
  city: z.string().min(2),
});

const SalonPage = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: salonRes, isLoading } = useQuery({ queryKey: ['my-salon'], queryFn: ownerAPI.getMySalon });
  const salon = salonRes?.data?.data;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(salonSchema),
    values: salon ? { name: salon.name, description: salon.description || '', address: salon.address, city: salon.city } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data) => salon ? ownerAPI.updateSalon(salon._id, data) : salonsAPI.create(data),
    onSuccess: () => {
      addToast(salon ? 'Salon updated!' : 'Salon created! 🎉', 'success');
      queryClient.invalidateQueries(['my-salon']);
    },
    onError: (err) => addToast(err.response?.data?.message || 'Failed to save salon.', 'error'),
  });

  if (isLoading) return <div className="h-64 skeleton rounded-2xl" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{salon ? 'Edit Salon Profile' : 'Create Your Salon'}</h1>
      <div className="glass-card p-6 max-w-xl">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-5" id="salon-form">
          <div>
            <label className="form-label">Salon Name</label>
            <input id="salon-name" className={`input-field ${errors.name ? 'error' : ''}`} placeholder="The Velvet Chair" {...register('name')} />
            {errors.name && <p className="field-error">⚠ {errors.name.message}</p>}
          </div>
          <div>
            <label className="form-label">Description <span className="text-white/30">(optional)</span></label>
            <textarea id="salon-desc" rows={3} className="input-field resize-none" placeholder="Tell customers what makes your salon special…" {...register('description')} />
          </div>
          <div>
            <label className="form-label">Address</label>
            <input id="salon-address" className={`input-field ${errors.address ? 'error' : ''}`} placeholder="123, MG Road" {...register('address')} />
            {errors.address && <p className="field-error">⚠ {errors.address.message}</p>}
          </div>
          <div>
            <label className="form-label">City</label>
            <input id="salon-city" className={`input-field ${errors.city ? 'error' : ''}`} placeholder="Mumbai" {...register('city')} />
            {errors.city && <p className="field-error">⚠ {errors.city.message}</p>}
          </div>
          <button id="salon-save" type="submit" disabled={isSubmitting || createMutation.isPending} className="btn-primary w-full py-3">
            {createMutation.isPending ? 'Saving…' : salon ? 'Update Salon' : 'Create Salon'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Services Page ────────────────────────────────────────────────────────────

const CATEGORIES = ['haircut', 'coloring', 'styling', 'treatment', 'beard', 'facial', 'nails', 'massage', 'other'];

const ServiceForm = ({ salonId, onClose }) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const { mutate } = useMutation({
    mutationFn: (data) => ownerAPI.createService(salonId, { ...data, price: Number(data.price), durationMinutes: Number(data.durationMinutes) }),
    onSuccess: () => { addToast('Service added!', 'success'); queryClient.invalidateQueries(['services', salonId]); onClose(); },
    onError: (err) => addToast(err.response?.data?.message || 'Failed to add service.', 'error'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4" id="service-form">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="form-label">Service Name</label>
          <input className="input-field" placeholder="e.g. Men's Haircut" {...register('name', { required: true })} />
        </div>
        <div>
          <label className="form-label">Category</label>
          <select className="input-field" {...register('category', { required: true })}>
            {CATEGORIES.map((c) => <option key={c} value={c} className="bg-surface-900">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Price (₹)</label>
          <input type="number" min="0" className="input-field" placeholder="500" {...register('price', { required: true })} />
        </div>
        <div>
          <label className="form-label">Duration (mins)</label>
          <input type="number" min="5" className="input-field" placeholder="45" {...register('durationMinutes', { required: true })} />
        </div>
        <div>
          <label className="form-label">Description <span className="text-white/30">(optional)</span></label>
          <input className="input-field" placeholder="Short description" {...register('description')} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3">Add Service</button>
      </div>
    </form>
  );
};

const ServicesPage = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: salonRes } = useQuery({ queryKey: ['my-salon'], queryFn: ownerAPI.getMySalon });
  const salon = salonRes?.data?.data;

  const { data: servicesRes, isLoading } = useQuery({
    queryKey: ['services', salon?._id],
    queryFn: () => servicesAPI.getBySalon(salon._id),
    enabled: !!salon?._id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ownerAPI.deleteService(id),
    onSuccess: () => { addToast('Service removed.', 'success'); queryClient.invalidateQueries(['services', salon._id]); },
    onError: () => addToast('Failed to remove service.', 'error'),
  });

  const services = servicesRes?.data?.data || [];

  if (!salon) return <div className="text-white/50">Create your salon profile first to add services.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Services</h1>
        <button id="add-service" onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-5 py-2.5">
          + Add Service
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">New Service</h2>
          <ServiceForm salonId={salon._id} onClose={() => setShowForm(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <div className="text-5xl mb-4">✂️</div>
          <p>No services yet. Click "+ Add Service" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service._id} className="glass-card p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="badge-violet text-xs">{service.category}</span>
                  <span className="text-white font-medium">{service.name}</span>
                </div>
                <div className="text-white/40 text-sm mt-0.5">{service.durationMinutes} min</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gold-400 font-bold">₹{service.price}</span>
                <button
                  onClick={() => deleteMutation.mutate(service._id)}
                  className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Staff Page ───────────────────────────────────────────────────────────────

const StaffPage = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newSpecialties, setNewSpecialties] = useState('');

  const { data: salonRes } = useQuery({ queryKey: ['my-salon'], queryFn: ownerAPI.getMySalon });
  const salon = salonRes?.data?.data;

  const { data: staffRes, isLoading } = useQuery({
    queryKey: ['staff-owner', salon?._id],
    queryFn: () => staffAPI.getBySalon(salon._id),
    enabled: !!salon?._id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      formData.append('name', data.name);
      data.specialties.forEach((s) => formData.append('specialties', s));
      return ownerAPI.createStaff(salon._id, formData);
    },
    onSuccess: () => {
      addToast('Staff member added!', 'success');
      queryClient.invalidateQueries(['staff-owner', salon._id]);
      setShowForm(false);
      setNewStaffName('');
      setNewSpecialties('');
    },
    onError: (err) => addToast(err.response?.data?.message || 'Failed to add staff.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ownerAPI.deleteStaff(id),
    onSuccess: () => { addToast('Staff member removed.', 'success'); queryClient.invalidateQueries(['staff-owner', salon._id]); },
  });

  const staff = staffRes?.data?.data || [];

  if (!salon) return <div className="text-white/50">Create your salon profile first to add staff.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Staff</h1>
        <button id="add-staff" onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-5 py-2.5">
          + Add Staff
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Add Staff Member</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Name</label>
              <input id="staff-name" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} className="input-field" placeholder="e.g. Priya Sharma" />
            </div>
            <div>
              <label className="form-label">Specialties <span className="text-white/30">(comma-separated)</span></label>
              <input id="staff-specialties" value={newSpecialties} onChange={(e) => setNewSpecialties(e.target.value)} className="input-field" placeholder="Haircut, Coloring, Styling" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-3">Cancel</button>
              <button
                onClick={() => createMutation.mutate({ name: newStaffName, specialties: newSpecialties.split(',').map((s) => s.trim()).filter(Boolean) })}
                disabled={!newStaffName || createMutation.isPending}
                className="btn-primary flex-1 py-3"
              >
                {createMutation.isPending ? 'Adding…' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 skeleton rounded-xl" />)}
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <div className="text-5xl mb-4">👥</div>
          <p>No staff members yet. Add your first stylist!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {staff.map((member) => (
            <div key={member._id} className="glass-card p-4 text-center">
              <div className="w-14 h-14 rounded-full mx-auto mb-3 overflow-hidden">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-white font-medium text-sm mb-1">{member.name}</div>
              {member.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mb-3">
                  {member.specialties.slice(0, 2).map((s) => (
                    <span key={s} className="badge-violet text-xs">{s}</span>
                  ))}
                </div>
              )}
              <button
                onClick={() => deleteMutation.mutate(member._id)}
                className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Bookings Page ────────────────────────────────────────────────────────────

const BookingsPage = () => {
  const { data: salonRes } = useQuery({ queryKey: ['my-salon'], queryFn: ownerAPI.getMySalon });
  const salon = salonRes?.data?.data;

  const { data: bookingsRes, isLoading } = useQuery({
    queryKey: ['owner-bookings', salon?._id],
    queryFn: () => ownerAPI.getBookings(salon._id),
    enabled: !!salon?._id,
  });

  const bookings = bookingsRes?.data?.data || [];
  const STATUS_COLORS = { confirmed: 'badge-green', pending: 'badge-gold', cancelled: 'text-red-400', completed: 'badge-violet' };

  if (!salon) return <div className="text-white/50">Create your salon profile first.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Bookings</h1>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <div className="text-5xl mb-4">📅</div>
          <p>No bookings yet. Share your salon link with customers!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="glass-card p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                <div>
                  <div className="text-white/40 text-xs">Customer</div>
                  <div className="text-white font-medium">{b.customerId?.name}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">Service</div>
                  <div className="text-white font-medium">{b.serviceId?.name}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">Staff</div>
                  <div className="text-white font-medium">{b.staffId?.name}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">Date & Time</div>
                  <div className="text-white font-medium">{b.date} · {b.startTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-gold-400 font-bold">₹{b.amount}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[b.status] || 'badge-violet'}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} logout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 lg:ml-64 p-6 pt-8">
        {/* Mobile header */}
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-white/5 text-white/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-bold font-display">StyleSync Owner</span>
          <div className="w-9" />
        </div>

        <Routes>
          <Route index element={<OverviewPage user={user} />} />
          <Route path="salon" element={<SalonPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="bookings" element={<BookingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
