import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, isAuthenticated, isOwner, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3 border-b border-white/10'
          : 'py-5'
      }`}
      style={{
        background: scrolled ? 'rgba(10, 8, 18, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" id="nav-logo">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/salons" id="nav-salons" className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
            Find Salons
          </Link>
          {isAuthenticated && isOwner && (
            <Link to="/owner" id="nav-owner" className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
              Dashboard
            </Link>
          )}
          {isAuthenticated && !isOwner && (
            <Link to="/dashboard" id="nav-dashboard" className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
              My Bookings
            </Link>
          )}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-white text-sm font-medium">{user?.name?.split(' ')[0]}</span>
              </div>
              <button
                id="nav-logout"
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" id="nav-login" className="btn-secondary text-sm px-5 py-2">
                Sign In
              </Link>
              <Link to="/register" id="nav-register" className="btn-primary text-sm px-5 py-2">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          id="nav-hamburger"
          className="md:hidden p-2 rounded-lg bg-white/5 text-white/70 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-white/10 animate-slide-up"
          style={{ background: 'rgba(10, 8, 18, 0.95)', backdropFilter: 'blur(20px)' }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <Link to="/salons" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-sm">🔍 Find Salons</Link>
            {isAuthenticated && isOwner && <Link to="/owner" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-sm">📊 Dashboard</Link>}
            {isAuthenticated && !isOwner && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-sm">📅 My Bookings</Link>}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full btn-secondary py-3">Log out</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-center py-3">Sign In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center py-3">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
