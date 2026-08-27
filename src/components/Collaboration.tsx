import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip } from '../types';
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
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
              Shared Itinerary
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Users className="w-5 h-5 text-[#1A1A1A]" />
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A]">
                Travel Party & Suggestions
              </h2>
            </div>
            <p className="text-xs text-[#8C8881] mt-1">
              Collaborators can propose activities for the trip organizer to approve with 1 click.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#FDFCFB] hover:bg-white text-[#8C8881] hover:text-[#1A1A1A] border border-[#E5E1DA]'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Companion</span>
            </button>
          </div>
        </div>

        {/* Collaborators Roster */}
        <div className="pt-4 border-t border-[#E5E1DA] space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881] block">
            Travel Party ({trip.collaborators.length})
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {trip.collaborators.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#E5E1DA]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-semibold text-xs text-[#1A1A1A] leading-tight">
                      {c.name} {c.id === trip.ownerId && '(Owner)'}
                    </h4>
                    <span className="text-[10px] text-[#8C8881]">{c.email}</span>
                  </div>
                </div>

                <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#E5E1DA] text-[#1A1A1A]">
                  {c.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestion Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-4">
          <div>
            <h3 className="font-serif text-xl font-light text-[#1A1A1A] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1A1A1A]" />
              Suggestion Box
            </h3>
            <p className="text-xs text-[#8C8881] mt-0.5">
              Review and accept ideas proposed by your travel party directly into the itinerary.
            </p>
          </div>

          <button
            onClick={() => setShowSuggestModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Propose Stop</span>
          </button>
        </div>

        {/* Suggestion List */}
        {trip.suggestions.length === 0 ? (
          <div className="text-center py-8 space-y-2 text-[#8C8881]">
            <MessageSquare className="w-6 h-6 mx-auto stroke-1" />
            <p className="text-xs">No pending suggestions. Invite your travel party to propose spots.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trip.suggestions.map((sug) => (
              <div
                key={sug.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  sug.status === 'approved'
                    ? 'bg-[#FDFCFB] border-[#1A1A1A]'
                    : sug.status === 'declined'
                    ? 'bg-[#FDFCFB] border-[#E5E1DA] opacity-50'
                    : 'bg-white border-[#E5E1DA] shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={sug.authorAvatar}
                    alt={sug.authorName}
                    className="w-8 h-8 rounded-full object-cover border border-[#E5E1DA] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1A1A1A]">{sug.authorName}</span>
                      <span className="text-[10px] text-[#8C8881]">• Day {sug.dayNumber}</span>
                      {sug.estCost > 0 && (
                        <span className="text-[9px] font-mono font-bold text-[#1A1A1A] bg-[#E5E1DA] px-1.5 py-0.2 rounded">
                          ${sug.estCost}
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif text-base font-light text-[#1A1A1A]">
                      {sug.title}
                    </h4>

                    {sug.description && (
                      <p className="text-xs text-[#8C8881] leading-relaxed">
                        "{sug.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Status & Approve/Decline Controls for Organizer */}
                <div className="flex items-center gap-2 shrink-0">
                  {sug.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => approveSuggestion(trip.id, sug.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Approve and add directly to itinerary"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => declineSuggestion(trip.id, sug.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#E5E1DA] hover:bg-[#F9F8F6] text-[#8C8881] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#E5E1DA] text-[#1A1A1A] uppercase tracking-wider">
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
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E5E1DA] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                Invite Travel Companion
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F9F8F6] text-[#8C8881] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="companion@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Permission Level
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none"
                >
                  <option value="editor">Editor (Can add/edit stops & propose ideas)</option>
                  <option value="viewer">Viewer (Can view timeline & check off packing)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] hover:bg-[#F9F8F6] text-[#8C8881] text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E5E1DA] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
              <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                Propose a Spot to Group
              </h3>
              <button
                type="button"
                onClick={() => setShowSuggestModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F9F8F6] text-[#8C8881] hover:text-[#1A1A1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSuggestion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Proposed Venue or Experience *
                </label>
                <input
                  type="text"
                  required
                  value={suggestTitle}
                  onChange={(e) => setSuggestTitle(e.target.value)}
                  placeholder="e.g. Hidden Rooftop Tea House or Bamboo Grove Sunrise"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    Suggested Day
                  </label>
                  <select
                    value={suggestDay}
                    onChange={(e) => setSuggestDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] focus:outline-none"
                  >
                    {trip.days.map((d) => (
                      <option key={d.id} value={d.dayNumber}>
                        Day {d.dayNumber} ({d.destination.split(',')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                    Est. Cost (USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={suggestCost}
                    onChange={(e) => setSuggestCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs font-mono text-[#1A1A1A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Why you recommend it
                </label>
                <textarea
                  rows={2}
                  value={suggestDesc}
                  onChange={(e) => setSuggestDesc(e.target.value)}
                  placeholder="e.g. A local friend recommended this quiet garden near the river..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setShowSuggestModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] hover:bg-[#F9F8F6] text-[#8C8881] text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-xs cursor-pointer"
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
