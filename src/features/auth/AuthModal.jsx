import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, KeyRound, ShieldCheck, User } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onSignIn, onVerify }) {
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await onSignIn(email, displayName, upiId);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send login code. Please check your email.');
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
      await onVerify(email, otp);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container-high text-on-surface">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-headline">Welcome to RoomSplit</h2>
              <p className="text-xs text-on-surface-variant">Sign in with email verification code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1 rounded-full text-lg leading-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-xs font-medium">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full h-11 px-3 pl-9 rounded-lg bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-sm outline-none transition-all"
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
                  className="w-full h-11 px-3 pl-9 rounded-lg bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-sm outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-outline absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                UPI ID (Optional for repayments)
              </label>
              <input
                type="text"
                placeholder="e.g. aditi@okaxis"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-sm outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 bg-secondary text-on-secondary font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-secondary-container active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Send Login Code'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
              We sent a 6-digit verification code to <span className="font-semibold text-on-surface">{email}</span>.
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Enter Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  value={otp}
                  onChange={e => setOtp(e.target.value.trim())}
                  className="w-full h-12 px-3 text-center tracking-widest text-lg font-bold rounded-lg bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white outline-none transition-all"
                />
                <KeyRound className="w-4 h-4 text-outline absolute left-3 top-4" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-1/3 h-12 bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-semibold rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-secondary text-on-secondary font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-secondary-container active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Enter Room'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
