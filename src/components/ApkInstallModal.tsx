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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E1DA] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E5E1DA] flex items-center justify-between bg-[#FDFCFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
                Roll Out Mobile App / APK
              </h3>
              <p className="text-xs text-[#8C8881]">
                Install TripLink natively on Android, iOS, or Desktop
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8881] hover:text-[#1A1A1A] rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Quick Install Action Banner */}
          <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#E5E1DA] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  PWA & Android Standalone Ready
                </span>
                <h4 className="font-serif text-base font-medium text-[#1A1A1A] mt-1">
                  1-Tap Native Installation
                </h4>
                <p className="text-xs text-[#8C8881] mt-0.5">
                  Instant offline caching, full-screen mobile gestures, and zero-app-store latency.
                </p>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isInstalled ? 'App Already Installed' : 'Install App to Device'}
            </button>
          </div>

          {/* OS-Specific Tabs */}
          <div className="space-y-3">
            <div className="flex border-b border-[#E5E1DA] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('android')}
                className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'android'
                    ? 'border-[#1A1A1A] text-[#1A1A1A]'
                    : 'border-transparent text-[#8C8881] hover:text-[#1A1A1A]'
                }`}
              >
                Android / Chrome
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'ios'
                    ? 'border-[#1A1A1A] text-[#1A1A1A]'
                    : 'border-transparent text-[#8C8881] hover:text-[#1A1A1A]'
                }`}
              >
                iOS / Safari
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'border-[#1A1A1A] text-[#1A1A1A]'
                    : 'border-transparent text-[#8C8881] hover:text-[#1A1A1A]'
                }`}
              >
                Desktop App
              </button>
            </div>

            {/* Android instructions */}
            {activeTab === 'android' && (
              <div className="space-y-3 text-xs text-[#1A1A1A]">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FDFCFB] border border-[#E5E1DA]">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white font-mono text-[10px] flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="font-medium">Open in Chrome or Samsung Internet</p>
                    <p className="text-[#8C8881] text-[11px]">Navigate to your live app URL on your phone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FDFCFB] border border-[#E5E1DA]">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white font-mono text-[10px] flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="font-medium">Tap the Browser Menu (⋮)</p>
                    <p className="text-[#8C8881] text-[11px]">Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FDFCFB] border border-[#E5E1DA]">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white font-mono text-[10px] flex items-center justify-center shrink-0">3</span>
                  <div>
                    <p className="font-medium">Direct APK Generation (Bubblewrap / PWABuilder)</p>
                    <p className="text-[#8C8881] text-[11px]">
                      You can package this live URL directly into a signed `.apk` file using standard <strong>PWABuilder.com</strong> or Google's <strong>Bubblewrap CLI</strong> with full Play Store compatibility.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS instructions */}
            {activeTab === 'ios' && (
              <div className="space-y-3 text-xs text-[#1A1A1A]">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FDFCFB] border border-[#E5E1DA]">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white font-mono text-[10px] flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="font-medium">Open Safari on iPhone or iPad</p>
                    <p className="text-[#8C8881] text-[11px]">Navigate to the app URL.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FDFCFB] border border-[#E5E1DA]">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white font-mono text-[10px] flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="font-medium">Tap the Share Icon (<Share2 className="w-3.5 h-3.5 inline" />)</p>
                    <p className="text-[#8C8881] text-[11px]">Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FDFCFB] border border-[#E5E1DA]">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white font-mono text-[10px] flex items-center justify-center shrink-0">3</span>
                  <div>
                    <p className="font-medium">Enjoy Native Fullscreen</p>
                    <p className="text-[#8C8881] text-[11px]">Opens like a standalone iOS app with no browser chrome.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop instructions */}
            {activeTab === 'desktop' && (
              <div className="space-y-3 text-xs text-[#1A1A1A]">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FDFCFB] border border-[#E5E1DA]">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white font-mono text-[10px] flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="font-medium">Look in the Address Bar</p>
                    <p className="text-[#8C8881] text-[11px]">Click the <strong>Install</strong> icon in the right side of Chrome/Edge address bar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FDFCFB] border border-[#E5E1DA]">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white font-mono text-[10px] flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="font-medium">Launch from Dock / Start Menu</p>
                    <p className="text-[#8C8881] text-[11px]">Runs in its own window with keyboard shortcuts.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Capabilities included */}
          <div className="pt-2 border-t border-[#E5E1DA] grid grid-cols-2 gap-2 text-[11px] text-[#8C8881]">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Cache Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Gesture Swiping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Drive Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gemini AI Scanner</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E1DA] bg-[#FDFCFB] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
