import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed / running standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed in this session
    const wasDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    if (isAppleMobile) {
      setIsIos(true);
    }

    // Listen for Chrome / Android beforeinstallprompt
    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  }

  if (isInstalled || dismissed || (!isInstallable && !isIos)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-3 duration-300">
      <div className="bg-surface-container-lowest/95 backdrop-blur-xl border border-secondary/20 shadow-xl rounded-2xl p-3.5 flex items-center justify-between gap-3 text-on-surface">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
            RS
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-headline truncate">Install RoomSplit</span>
              <span className="px-1.5 py-0.2 bg-secondary/10 text-secondary text-[9px] font-bold rounded-full">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant truncate">
              Install as an app for fast offline access & settlements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="h-8 px-3 bg-secondary hover:bg-secondary-container text-on-secondary text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg text-outline hover:text-on-surface flex items-center justify-center transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Instructions modal / tooltip */}
      {showIosGuide && (
        <div className="mt-2 p-3 bg-surface-container rounded-xl border border-surface-container-high text-xs text-on-surface shadow-md">
          <p className="font-semibold mb-1">To install on iPhone / iPad:</p>
          <ol className="list-decimal pl-4 space-y-0.5 text-on-surface-variant text-[11px]">
            <li>Tap the <strong>Share</strong> button in Safari (box with arrow).</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong> in the top right corner.</li>
          </ol>
          <button
            onClick={() => setShowIosGuide(false)}
            className="mt-2 text-xs font-bold text-secondary"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
