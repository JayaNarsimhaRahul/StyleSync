import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6 animate-float">✂️</div>
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-white/50 text-xl mb-2">This page got a bad haircut.</p>
      <p className="text-white/30 text-sm mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary px-8 py-3">
        Back to Home
      </Link>
    </div>
  );
}
