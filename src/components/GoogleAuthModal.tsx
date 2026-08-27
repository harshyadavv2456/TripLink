import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import {
  X,
  HardDrive,
  CheckCircle,
  FolderSync,
  Image as ImageIcon,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { user, connectGoogleUser, disconnectGoogleUser, toggleGoogleDriveSync } = useTrip();

  const [inputEmail, setInputEmail] = useState(user.email || 'harshyadavv2456@gmail.com');
  const [inputName, setInputName] = useState(user.name || 'Harsh Yadav');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedGoogleLogin = () => {
    setIsSyncing(true);
    setTimeout(() => {
      connectGoogleUser({
        id: `google-${Date.now()}`,
        name: inputName,
        email: inputEmail,
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        accessToken: `ya29.${Math.random().toString(36).substring(2, 15)}`,
        connectedAt: new Date().toISOString(),
        driveFolderId: 'trip-vault-main',
      });
      setIsSyncing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="luxury-card-elevated rounded-3xl max-w-md w-full border-white/20 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0D0F15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-white">
                Google Workspace & Drive Sync
              </h3>
              <p className="text-xs text-stone-400">
                Continuous cloud backup for memories & tickets
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

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {user.googleUser ? (
            /* Connected state */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30">
                <img
                  src={user.avatar || user.googleUser.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border border-white/20 object-cover"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-sm font-medium text-white">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Synchronized
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">{user.email}</p>
                  <p className="text-[10px] font-mono text-emerald-400">
                    Google Drive: /TripLink-Vault/
                  </p>
                </div>
              </div>

              {/* Drive Features */}
              <div className="space-y-2.5 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] cursor-pointer hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-[#E5C578]" />
                    <div>
                      <p className="font-medium text-stone-200">Auto-sync memories & photos to Google Drive</p>
                      <p className="text-[11px] text-stone-400">High-res images stored in private cloud vault</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={user.googleDriveConnected ?? true}
                    onChange={(e) => toggleGoogleDriveSync(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                </label>

                <div className="p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <FolderSync className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Cloud Backup Status</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active & Encrypted
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={disconnectGoogleUser}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-stone-200 cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Login prompt */
            <div className="space-y-4">
              <p className="text-xs text-stone-400 leading-relaxed">
                Connect your Google account to automatically store journal photos in your Google Drive, sync itineraries across your devices, and share live trip links.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#E5C578]"
                    placeholder="e.g. Harsh Yadav"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                    Google Email
                  </label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#E5C578]"
                    placeholder="e.g. harshyadavv2456@gmail.com"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulatedGoogleLogin}
                disabled={isSyncing}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer btn-tactile"
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
                <span>{isSyncing ? 'Authenticating with Google...' : 'Continue with Google'}</span>
              </button>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-stone-400 font-mono">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E5C578]" />
                  Encrypted Drive Sync
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Private Vault
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
