import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, X, Link as LinkIcon } from 'lucide-react';

export function InviteModal({ isOpen, onClose, inviteLink, roomName }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function handleCopy() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard failed:', err);
    }
  }

  function handleWhatsAppShare() {
    const text = encodeURIComponent(
      `Hey! Join our shared flat expenses ledger on RoomSplit for ${roomName || 'our flat'}:\n${inviteLink}\n\nTrack splits, view fair balances, and settle via UPI.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${roomName} on RoomSplit`,
          text: `Track shared living expenses, view fair balances, and settle via UPI for ${roomName}.`,
          url: inviteLink,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container-high text-on-surface">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline">Invite Roommates</h2>
              <p className="text-xs text-on-surface-variant truncate max-w-[220px]">
                {roomName || 'Flat 402'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1 rounded-full text-lg leading-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Anyone with this invitation link can join your room ledger, view balances, and split bills.
        </p>

        {/* Link Box */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant mb-4">
          <span className="text-xs font-mono text-on-surface truncate flex-1 select-all">
            {inviteLink || 'Generating link...'}
          </span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface flex items-center gap-1 hover:bg-surface-container-high active:scale-95 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="h-11 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Link</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>Link valid for 7 days</span>
          <span>Max 20 uses</span>
        </div>
      </div>
    </div>
  );
}
