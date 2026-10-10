import React, { useState } from 'react';
import { X, Building2, MapPin, Plus, Check } from 'lucide-react';

export function CreateRoomModal({ isOpen, onClose, onCreateRoom, user, onOpenAuth }) {
  const [roomName, setRoomName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) {
        onClose();
        onOpenAuth();
      } else {
        setError('Please sign in first to create a room.');
      }
      return;
    }

    if (!roomName.trim()) {
      setError('Please provide a room or flat name.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onCreateRoom(roomName, address);
      setRoomName('');
      setAddress('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-surface-container-high text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline">Create New Room</h2>
              <p className="text-xs text-on-surface-variant">Set up a shared expense ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!user ? (
          <div className="text-center py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 text-left">
              <p className="text-xs font-semibold text-secondary mb-1">Sign-in Required</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Sign in with your Gmail or account so all your rooms and roommate expenses are safely stored in your account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="w-full h-11 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>Sign In to Continue</span>
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium">
                {error}
              </div>
            )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Room / Flat Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Flat 402, Green Glen, Koramangala 5th Block"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                className="w-full h-11 px-3.5 pl-10 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-sm outline-none transition-all font-medium"
              />
              <Building2 className="w-4 h-4 text-outline absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Address / Note (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Bellandur, Bengaluru"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full h-11 px-3.5 pl-10 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-sm outline-none transition-all font-medium"
              />
              <MapPin className="w-4 h-4 text-outline absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant flex items-center justify-between">
            <span>Currency</span>
            <span className="font-bold text-on-surface">Indian Rupee (₹ INR)</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Creating Room...' : 'Create Room & Start Splitting'}
            <Plus className="w-4 h-4" />
          </button>
        </form>
        </>
        )}
      </div>
    </div>
  );
}
