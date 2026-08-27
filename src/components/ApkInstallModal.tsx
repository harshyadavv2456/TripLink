import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  CheckCircle,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ApkInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkInstallModal: React.FC<ApkInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: guide user
      alert('To install on your mobile device, tap your browser menu (⋮ or Share) and select "Add to Home screen" or "Install app".');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="luxury-card-elevated rounded-3xl max-w-lg w-full border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0D0F15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6B1B] p-[1px] shadow-lg">
              <div className="w-full h-full bg-[#0E1017] rounded-[15px] flex items-center justify-center text-[#E5C578]">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-white">
                Roll Out Mobile App / APK
              </h3>
              <p className="text-xs text-stone-400">
                Install TripLink natively on Android, iOS, or Desktop
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Quick Install Action Banner */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-[#E5C578]/30 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  PWA & Android Standalone Ready
                </span>
                <h4 className="font-serif text-lg font-medium text-white mt-1.5">
                  1-Tap Native Installation
                </h4>
                <p className="text-xs text-stone-400 mt-0.5 font-light">
                  Instant offline caching, full-screen mobile swipe gestures, and zero-latency access.
                </p>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] hover:brightness-110 text-[#090A0E] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 btn-tactile cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isInstalled ? 'App Already Installed' : 'Install App to Device'}</span>
            </button>
          </div>

          {/* OS-Specific Tabs */}
          <div className="space-y-3">
            <div className="flex border-b border-white/[0.08] text-xs font-mono font-bold">
              <button
                onClick={() => setActiveTab('android')}
                className={`pb-2.5 px-3.5 border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                  activeTab === 'android'
                    ? 'border-[#E5C578] text-[#E5C578]'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                Android / Chrome
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`pb-2.5 px-3.5 border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                  activeTab === 'ios'
                    ? 'border-[#E5C578] text-[#E5C578]'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                iOS / Safari
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`pb-2.5 px-3.5 border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                  activeTab === 'desktop'
                    ? 'border-[#E5C578] text-[#E5C578]'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                Desktop App
              </button>
            </div>

            {/* Android instructions */}
            {activeTab === 'android' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="w-5 h-5 rounded-full bg-[#E5C578] text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="font-medium text-white">Open in Chrome or Samsung Internet</p>
                    <p className="text-stone-400 text-[11px]">Navigate to your live app URL on your phone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="w-5 h-5 rounded-full bg-[#E5C578] text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="font-medium text-white">Tap the Browser Menu (⋮)</p>
                    <p className="text-stone-400 text-[11px]">Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="w-5 h-5 rounded-full bg-[#E5C578] text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <p className="font-medium text-white">Direct APK Generation (Bubblewrap / PWABuilder)</p>
                    <p className="text-stone-400 text-[11px]">
                      Package this live URL into a signed <strong className="text-white">.apk</strong> file using standard <strong className="text-white">PWABuilder.com</strong> or Google's <strong className="text-white">Bubblewrap CLI</strong> for Google Play Store publication.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS instructions */}
            {activeTab === 'ios' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="w-5 h-5 rounded-full bg-[#E5C578] text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="font-medium text-white">Open Safari on iPhone or iPad</p>
                    <p className="text-stone-400 text-[11px]">Navigate to the app URL.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="w-5 h-5 rounded-full bg-[#E5C578] text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="font-medium text-white">Tap the Share Icon (<Share2 className="w-3.5 h-3.5 inline text-[#E5C578]" />)</p>
                    <p className="text-stone-400 text-[11px]">Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="w-5 h-5 rounded-full bg-[#E5C578] text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <p className="font-medium text-white">Enjoy Native Fullscreen</p>
                    <p className="text-stone-400 text-[11px]">Opens like a standalone iOS app with no browser chrome.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop instructions */}
            {activeTab === 'desktop' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="w-5 h-5 rounded-full bg-[#E5C578] text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="font-medium text-white">Look in the Address Bar</p>
                    <p className="text-stone-400 text-[11px]">Click the <strong className="text-white">Install</strong> icon in the right side of Chrome/Edge address bar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="w-5 h-5 rounded-full bg-[#E5C578] text-black font-mono text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="font-medium text-white">Launch from Dock / Start Menu</p>
                    <p className="text-stone-400 text-[11px]">Runs in its own window with keyboard shortcuts.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Capabilities included */}
          <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2.5 text-[11px] text-stone-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline Cache Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Gesture Swiping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Drive Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gemini AI Engine</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0D0F15] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
