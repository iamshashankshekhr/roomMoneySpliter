import React, { useState } from 'react';
import { Mail, Lock, CheckCircle2, ArrowRight, ShieldCheck, User, Sparkles } from 'lucide-react';

export function AuthModal({
  isOpen,
  onClose,
  onSignInWithPassword,
  onSignUpWithPassword,
  onSignInWithGoogle,
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

  async function handleGoogleLogin() {
    if (!onSignInWithGoogle) return;
    setLoading(true);
    setError('');
    try {
      await onSignInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in could not be initiated.');
      setLoading(false);
    }
  }

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
              <p className="text-xs text-on-surface-variant">Sign in to save and access your rooms</p>
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

        {/* Google OAuth Quick Button */}
        {mode !== 'otp' && onSignInWithGoogle && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 bg-surface-container-low hover:bg-surface-container border border-surface-container text-on-surface font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-container" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-outline">
                <span className="bg-surface-container-lowest px-2">or with email</span>
              </div>
            </div>
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
