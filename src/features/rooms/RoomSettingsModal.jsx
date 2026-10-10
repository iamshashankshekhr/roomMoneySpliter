import React, { useState, useEffect } from 'react';
import { X, Settings, Building2, MapPin, Trash2, AlertTriangle, Check, Copy } from 'lucide-react';

export function RoomSettingsModal({
  isOpen,
  onClose,
  room,
  onRenameRoom,
  onDeleteRoom,
}) {
  const [roomName, setRoomName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (room && isOpen) {
      setRoomName(room.name || '');
      setAddress(room.settings?.address || '');
      setError('');
      setShowDeleteConfirm(false);
    }
  }, [room, isOpen]);

  if (!isOpen || !room) return null;

  async function handleSaveSettings(e) {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Room name cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onRenameRoom(room.id, roomName, address);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update room settings.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true);
    setError('');
    try {
      await onDeleteRoom(room.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete room. You must be an admin.');
      setIsDeleting(false);
    }
  }

  function handleCopyId() {
    navigator.clipboard.writeText(room.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-surface-container-high text-on-surface max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline">Room Settings</h2>
              <p className="text-xs text-on-surface-variant">Rename or manage room</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium">
            {error}
          </div>
        )}

        {/* 1. Rename & Address Form */}
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Room / Flat Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="e.g. Flat 402, Green Glen"
                className="w-full h-11 px-3.5 pl-10 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-sm outline-none transition-all font-medium"
              />
              <Building2 className="w-4 h-4 text-outline absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Address / Location Note
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Bellandur, Bengaluru"
                className="w-full h-11 px-3.5 pl-10 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-sm outline-none transition-all font-medium"
              />
              <MapPin className="w-4 h-4 text-outline absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl text-xs">
            <span className="text-on-surface-variant">Internal Room ID:</span>
            <button
              type="button"
              onClick={handleCopyId}
              className="font-mono text-[11px] text-secondary flex items-center gap-1 hover:underline"
            >
              <span>{room.id.slice(0, 8)}...</span>
              {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Room Changes'}
          </button>
        </form>

        {/* 2. Danger Zone: Delete Room */}
        <div className="mt-6 pt-4 border-t border-error/20">
          <div className="flex items-center gap-2 text-rose-600 mb-1.5">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
          </div>
          <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
            Deleting this room will permanently delete all expenses, splits, and calculations for all roommates.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete Room</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <p className="text-xs font-bold text-rose-800 text-center">
                Are you sure you want to delete "{room.name}"?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-9 bg-white text-on-surface text-xs font-semibold rounded-lg border border-outline-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Room'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
