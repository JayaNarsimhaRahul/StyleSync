import { Link } from 'react-router-dom';
import Logo from './Logo';

const LINKS = {
  Product: ['Find Salons', 'How It Works', 'Pricing'],
  'For Owners': ['List Your Salon', 'Owner Dashboard', 'Analytics'],
  Support: ['Help Center', 'Contact Us', 'Privacy Policy'],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="block mb-4 w-fit">
              <Logo textClass="text-white font-bold text-xl font-display" />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Discover top salons, book instantly, and look your absolute best — all in one place.
            </p>
            <div className="flex gap-3 mt-5">
              {['𝕏', 'in', 'f', '📸'].map((s) => (
                <button key={s} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-sm mb-4">{section}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link to="/" className="text-white/40 text-sm hover:text-white/80 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} StyleSync. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs text-white/30">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
