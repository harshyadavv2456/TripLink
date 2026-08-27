import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip } from '../types';
import { formatCurrency } from '../data/currencies';
import {
  Users,
  Share2,
  Check,
  Plus,
  XCircle,
  MessageSquare,
  CheckCircle2,
  X,
} from 'lucide-react';

interface CollaborationProps {
  trip: Trip;
}

export const Collaboration: React.FC<CollaborationProps> = ({ trip }) => {
  const {
    user,
    baseCurrency,
    addCollaborator,
    addSuggestion,
    approveSuggestion,
    declineSuggestion,
  } = useTrip();

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showSuggestModal, setShowSuggestModal] = useState<boolean>(false);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');

  // Suggestion state
  const [suggestTitle, setSuggestTitle] = useState<string>('');
  const [suggestDesc, setSuggestDesc] = useState<string>('');
  const [suggestDay, setSuggestDay] = useState<number>(1);
  const [suggestCost, setSuggestCost] = useState<number>(30);

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/#trip=${trip.id}&share=active`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    addCollaborator(trip.id, {
      name: inviteName || inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
    });

    setShowInviteModal(false);
    setInviteEmail('');
    setInviteName('');
  };

  const handleCreateSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestTitle.trim()) return;

    addSuggestion(trip.id, {
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      title: suggestTitle,
      description: suggestDesc,
      dayNumber: Number(suggestDay) || 1,
      estCost: Number(suggestCost) || 0,
      category: 'sightseeing',
    });

    setShowSuggestModal(false);
    setSuggestTitle('');
    setSuggestDesc('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Share Link */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
              Shared Journey Vault
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Users className="w-5 h-5 text-[#E5C578]" />
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-white">
                Travel Party & Suggestions
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Collaborators can propose activities for the trip organizer to approve with 1 tap.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'luxury-card hover:bg-white/[0.06] text-stone-300 hover:text-white border-white/10'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#E5C578]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 btn-tactile cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#090A0E] stroke-[2.5]" />
              <span>Invite Companion</span>
            </button>
          </div>
        </div>

        {/* Collaborators Roster */}
        <div className="pt-4 border-t border-white/[0.08] space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 block">
            Travel Party ({(trip.collaborators || []).length})
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {(trip.collaborators || []).map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl luxury-card border-white/[0.08] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-medium text-xs text-white leading-tight">
                      {c.name} {c.id === trip.ownerId && '(Owner)'}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono">{c.email}</span>
                  </div>
                </div>

                <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-lg bg-white/10 text-[#E5C578] border border-white/10">
                  {c.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestion Box */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="font-serif text-xl font-light text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#E5C578]" />
              Suggestion Box
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Review and accept ideas proposed by your travel party directly into the itinerary.
            </p>
          </div>

          <button
            onClick={() => setShowSuggestModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#E5C578]" />
            <span>Propose Stop</span>
          </button>
        </div>

        {/* Suggestion List */}
        {(trip.suggestions || []).length === 0 ? (
          <div className="text-center py-8 space-y-2 text-stone-500">
            <MessageSquare className="w-6 h-6 mx-auto stroke-1" />
            <p className="text-xs">No pending suggestions. Invite your travel party to propose spots.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(trip.suggestions || []).map((sug) => (
              <div
                key={sug.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  sug.status === 'approved'
                    ? 'luxury-card-elevated border-[#E5C578]/40'
                    : sug.status === 'declined'
                    ? 'luxury-card border-white/[0.04] opacity-50'
                    : 'luxury-card border-white/[0.08]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={sug.authorAvatar}
                    alt={sug.authorName}
                    className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{sug.authorName}</span>
                      <span className="text-[10px] text-stone-400 font-mono">• Day {sug.dayNumber}</span>
                      {sug.estCost > 0 && (
                        <span className="text-[9px] font-mono font-bold text-[#E5C578] bg-white/10 px-1.5 py-0.2 rounded">
                          {formatCurrency(sug.estCost, baseCurrency)}
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif text-base font-normal text-white">
                      {sug.title}
                    </h4>

                    {sug.description && (
                      <p className="text-xs text-stone-400 leading-relaxed font-light">
                        "{sug.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Status & Approve/Decline Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {sug.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => approveSuggestion(trip.id, sug.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        title="Approve and add directly to itinerary"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => declineSuggestion(trip.id, sug.id)}
                        className="px-3 py-1.5 rounded-xl border border-white/10 text-stone-400 hover:text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl bg-white/10 text-[#E5C578] uppercase tracking-wider border border-white/10">
                      {sug.status === 'approved' ? '✓ Added to Itinerary' : 'Declined'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Invite Traveler */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-card-elevated rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-xl font-light text-white">
                Invite Travel Companion
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="companion@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Permission Level
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none"
                >
                  <option value="editor">Editor (Can add/edit stops & propose ideas)</option>
                  <option value="viewer">Viewer (Can view timeline & check off packing)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Propose Suggestion */}
      {showSuggestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="luxury-card-elevated rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-xl font-light text-white">
                Propose a Spot to Group
              </h3>
              <button
                type="button"
                onClick={() => setShowSuggestModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSuggestion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Proposed Venue or Experience *
                </label>
                <input
                  type="text"
                  required
                  value={suggestTitle}
                  onChange={(e) => setSuggestTitle(e.target.value)}
                  placeholder="e.g. Hidden Rooftop Tea House or Bamboo Grove Sunrise"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Suggested Day
                  </label>
                  <select
                    value={suggestDay}
                    onChange={(e) => setSuggestDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none"
                  >
                    {(trip.days || []).map((d) => (
                      <option key={d.id} value={d.dayNumber}>
                        Day {d.dayNumber} ({d.destination.split(',')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Est. Cost (USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={suggestCost}
                    onChange={(e) => setSuggestCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                  Why you recommend it
                </label>
                <textarea
                  rows={2}
                  value={suggestDesc}
                  onChange={(e) => setSuggestDesc(e.target.value)}
                  placeholder="e.g. A quiet garden near the river..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowSuggestModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
