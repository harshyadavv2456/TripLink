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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#E5E1DA] shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E5E1DA] flex items-center justify-between bg-[#FDFCFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E1DA] flex items-center justify-center shadow-xs">
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
              <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
                Google Account & Drive Sync
              </h3>
              <p className="text-xs text-[#8C8881]">
                Seamlessly back up your memories & trip photos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8881] hover:text-[#1A1A1A] rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {user.googleUser ? (
            /* Connected state */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#FDFCFB] border border-emerald-200">
                <img
                  src={user.avatar || user.googleUser.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border border-[#E5E1DA] object-cover"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-sm font-medium text-[#1A1A1A]">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Connected
                    </span>
                  </div>
                  <p className="text-xs text-[#8C8881]">{user.email}</p>
                  <p className="text-[10px] font-mono text-emerald-700">
                    Google Drive Folder: /TripLink-Vault/
                  </p>
                </div>
              </div>

              {/* Drive Features */}
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl border border-[#E5E1DA] bg-white cursor-pointer hover:border-[#1A1A1A] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-[#1A1A1A]" />
                    <div>
                      <p className="font-medium text-[#1A1A1A]">Auto-sync memories & photos to Google Drive</p>
                      <p className="text-[11px] text-[#8C8881]">All high-res travel photos saved directly to your cloud</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={user.googleDriveConnected ?? true}
                    onChange={(e) => toggleGoogleDriveSync(e.target.checked)}
                    className="w-4 h-4 accent-[#1A1A1A] rounded"
                  />
                </label>

                <div className="p-3 rounded-xl border border-[#E5E1DA] bg-[#FDFCFB] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#8C8881]">
                    <FolderSync className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Cloud Backup Status</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Up to date
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={disconnectGoogleUser}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect Account
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Login prompt */
            <div className="space-y-4">
              <p className="text-xs text-[#8C8881] leading-relaxed">
                Connect your Google account to automatically store journal photos in your personal Google Drive, sync itineraries across your devices, and share live trip links with friends.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs focus:outline-none focus:border-[#1A1A1A]"
                    placeholder="e.g. Harsh Yadav"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                    Google Email
                  </label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs focus:outline-none focus:border-[#1A1A1A]"
                    placeholder="e.g. harshyadavv2456@gmail.com"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulatedGoogleLogin}
                disabled={isSyncing}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E5E1DA] text-[#1A1A1A] text-xs font-semibold hover:bg-[#FDFCFB] hover:border-[#1A1A1A] transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
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
                {isSyncing ? 'Connecting to Google...' : 'Continue with Google'}
              </button>

              <div className="pt-2 border-t border-[#E5E1DA] flex items-center justify-between text-[11px] text-[#8C8881]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Free cloud photo storage
                </span>
                <span>Encrypted & Private</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
