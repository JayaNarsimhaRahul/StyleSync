import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[0-9+\-\s()]{7,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'owner']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState('');

  const defaultRole = searchParams.get('role') === 'owner' ? 'owner' : 'customer';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const { confirmPassword, ...payload } = data;
      const res = await registerUser(payload);
      navigate(res.user.role === 'owner' ? '/owner' : '/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-700/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo size="w-10 h-10" textClass="text-white font-bold text-xl font-display" />
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-1">Create your account</h1>
          <p className="text-white/50 text-sm">Join thousands already using StyleSync</p>
        </div>

        <div className="glass-card p-8">
          {/* Role toggle */}
          <div className="flex gap-2 p-1.5 bg-white/5 rounded-xl mb-6">
            {[
              { value: 'customer', label: '👤 Customer', desc: 'Book appointments' },
              { value: 'owner', label: '💈 Salon Owner', desc: 'Manage your salon' },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                id={`role-${r.value}`}
                onClick={() => setValue('role', r.value)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedRole === r.value
                    ? 'bg-gradient-brand text-white shadow-brand'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
            <div>
              <label htmlFor="reg-name" className="form-label">Full name</label>
              <input id="reg-name" type="text" placeholder="Priya Sharma" className={`input-field ${errors.name ? 'error' : ''}`} {...register('name')} />
              {errors.name && <p className="field-error">⚠ {errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="form-label">Email address</label>
              <input id="reg-email" type="email" placeholder="you@example.com" className={`input-field ${errors.email ? 'error' : ''}`} {...register('email')} />
              {errors.email && <p className="field-error">⚠ {errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-phone" className="form-label">Phone <span className="text-white/30">(optional)</span></label>
              <input id="reg-phone" type="tel" placeholder="+91 98765 43210" className="input-field" {...register('phone')} />
              {errors.phone && <p className="field-error">⚠ {errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="form-label">Password</label>
              <input id="reg-password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className={`input-field ${errors.password ? 'error' : ''}`} {...register('password')} />
              {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="form-label">Confirm password</label>
              <input id="reg-confirm" type="password" placeholder="Repeat your password" className={`input-field ${errors.confirmPassword ? 'error' : ''}`} {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="field-error">⚠ {errors.confirmPassword.message}</p>}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                `Create ${selectedRole === 'owner' ? 'Salon Owner' : 'Customer'} Account`
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
