import React, { useState } from 'react';
import { Mail, Lock, CheckCircle2, ArrowRight, ShieldCheck, User, Sparkles } from 'lucide-react';

export function AuthModal({
  isOpen,
  onClose,
  onSignInWithPassword,
  onSignUpWithPassword,
  onSignInWithOtp,
  onVerifyOtp,
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  async function handlePasswordLogin(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      if (onSignInWithPassword) {
        await onSignInWithPassword(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSignup(e) {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (onSignUpWithPassword) {
        await onSignUpWithPassword(email, password, displayName, upiId);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      if (onSignInWithOtp) {
        await onSignInWithOtp(email, displayName, upiId);
      }
      setMode('otp');
      setSuccessMsg(`We sent a 6-digit login code to ${email}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');
    try {
      if (onVerifyOtp) {
        await onVerifyOtp(email, otp);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-surface-container-high text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline">Account Access</h2>
              <p className="text-xs text-on-surface-variant">Sign in with your email & password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors text-base leading-none"
          >
            ×
          </button>
        </div>

        {/* Tab switchers (Sign In vs Create Account) */}
        {mode !== 'otp' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface-container-low rounded-xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-secondary shadow-xs font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-secondary shadow-xs font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium">
            {error}
          </div>
        )}

        {successMsg && mode === 'otp' && (
          <div className="mb-4 p-3 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium">
            {successMsg}
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-xs outline-none transition-all font-medium"
                />
                <Mail className="w-4 h-4 text-outline absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-xs outline-none transition-all font-medium"
                />
                <Lock className="w-4 h-4 text-outline absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-1"
            >
              {loading ? 'Signing in...' : 'Sign In with Password'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !email}
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Or send OTP login code to email
              </button>
            </div>
          </form>
        )}

        {/* MODE: SIGNUP */}
        {mode === 'signup' && (
          <form onSubmit={handlePasswordSignup} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Your Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Shashank"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-xs outline-none transition-all font-medium"
                />
                <User className="w-4 h-4 text-outline absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-xs outline-none transition-all font-medium"
                />
                <Mail className="w-4 h-4 text-outline absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-xs outline-none transition-all font-medium"
                />
                <Lock className="w-4 h-4 text-outline absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. yourname@sbi"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-xs outline-none transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-1"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* MODE: OTP */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 text-center">
                Enter 6-Digit Email Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value.trim())}
                className="w-full h-12 px-3 text-center tracking-widest text-lg font-bold font-mono rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-1/3 h-11 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
