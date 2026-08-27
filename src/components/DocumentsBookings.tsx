import React, { useState, useRef } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip, DocumentType } from '../types';
import { formatCurrency } from '../data/currencies';
import {
  FileText,
  Plane,
  Building,
  Car,
  Ticket,
  Train,
  Shield,
  Copy,
  Check,
  Plus,
  Trash2,
  Calendar,
  X,
  Camera,
  Upload,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const DOC_CONFIG: Record<DocumentType, { label: string; icon: any }> = {
  flight: { label: 'Flight', icon: Plane },
  hotel: { label: 'Hotel & Stay', icon: Building },
  car: { label: 'Car Rental', icon: Car },
  rental: { label: 'Rental', icon: Car },
  ticket: { label: 'Ticket / Pass', icon: Ticket },
  activity: { label: 'Activity Pass', icon: Ticket },
  train: { label: 'Train / Rail', icon: Train },
  insurance: { label: 'Insurance', icon: Shield },
  other: { label: 'Document', icon: FileText },
};

interface DocumentsBookingsProps {
  trip: Trip;
}

export const DocumentsBookings: React.FC<DocumentsBookingsProps> = ({ trip }) => {
  const {
    addDocument,
    deleteDocument,
    scanBookingScreenshotAI,
    baseCurrency,
    isLoading,
    aiLoadingMessage,
  } = useTrip();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<DocumentType>('hotel');
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [date, setDate] = useState<string>(trip.startDate);
  const [cost, setCost] = useState<number>(150);
  const [seatOrRoom, setSeatOrRoom] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addDocument(trip.id, {
      title,
      type,
      confirmationCode,
      provider,
      date,
      cost: Number(cost) || 0,
      seatOrRoom,
      notes,
    });

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setConfirmationCode('');
    setProvider('');
    setSeatOrRoom('');
    setNotes('');
  };

  // Process File Upload for AI Multimodal Scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      try {
        const createdDoc = await scanBookingScreenshotAI(base64Data, trip.id, true);
        setScannedResult(createdDoc);
      } catch (err) {
        console.error('Scan error:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const totalBookingCost = (trip.documents || []).reduce((s, d) => s + (d.cost || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
              Logistics & Vault
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <FileText className="w-5 h-5 text-[#E5C578]" />
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-white">
                Bookings & Travel Documents
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Upload airline, train, or hotel receipts — Gemini AI automatically extracts your confirmation codes and syncs expenses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="luxury-card px-4 py-2 rounded-2xl border-white/[0.08] text-xs">
              <span className="text-stone-400 block uppercase font-mono font-bold text-[9px] tracking-wider">Total Pre-Booked</span>
              <span className="font-mono text-sm font-bold text-[#E5C578]">
                {formatCurrency(totalBookingCost, baseCurrency)}
              </span>
            </div>

            {/* AI Screenshot Scanner Button */}
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-[#E5C578]" />
              <span>AI Receipt Scan</span>
            </button>

            {/* Manual Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 btn-tactile cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#090A0E] stroke-[2.5]" />
              <span>Add Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(trip.documents || []).map((doc) => {
          const cfg = DOC_CONFIG[doc.type] || DOC_CONFIG.other;
          const Icon = cfg.icon;
          const isCopied = copiedCode === doc.confirmationCode;

          return (
            <div
              key={doc.id}
              className="luxury-card rounded-2xl p-5 border-white/[0.08] hover:border-white/20 transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-[#E5C578]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-stone-400">
                        {cfg.label} • {doc.provider || 'Confirmed'}
                      </span>
                      <h3 className="font-serif text-base font-normal text-white leading-snug">
                        {doc.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteDocument(trip.id, doc.id)}
                    className="p-1 rounded-lg text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Confirmation Code Copy Pill */}
                {doc.confirmationCode && (
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.08] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-mono font-bold block">
                        Confirmation / PNR
                      </span>
                      <span className="font-mono text-xs font-bold text-[#E5C578] tracking-wider">
                        {doc.confirmationCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(doc.confirmationCode!)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] font-mono font-bold text-white hover:bg-white/10 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-stone-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Details list */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {doc.date && (
                    <div className="flex items-center gap-1.5 text-stone-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#E5C578]" />
                      <span className="text-[11px]">{doc.date}</span>
                    </div>
                  )}

                  {doc.seatOrRoom && (
                    <div className="text-[11px] text-stone-300 font-mono text-right">
                      {doc.seatOrRoom}
                    </div>
                  )}
                </div>

                {doc.notes && (
                  <p className="text-[11px] text-stone-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.06] leading-relaxed">
                    {doc.notes}
                  </p>
                )}
              </div>

              {/* Cost footer */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-stone-400 text-[10px] uppercase font-mono font-bold tracking-wider">
                  Cost
                </span>
                <span className="font-mono text-xs font-bold text-[#E5C578]">
                  {doc.cost && doc.cost > 0 ? formatCurrency(doc.cost, baseCurrency) : 'Pre-paid'}
                </span>
              </div>
            </div>
          );
        })}

        {(trip.documents || []).length === 0 && (
          <div className="col-span-full p-10 rounded-3xl luxury-card border-dashed border-white/[0.1] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#E5C578]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-base font-medium text-white">No Bookings Added Yet</h4>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Scan your flight tickets, booking vouchers, or hotel confirmations to keep all confirmation codes in one safe vault.
              </p>
            </div>
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-stone-200 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Booking Screenshot</span>
            </button>
          </div>
        )}
      </div>

      {/* AI BOOKING SCANNER MODAL */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="luxury-card-elevated rounded-3xl max-w-lg w-full border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0D0F15]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 text-[#E5C578] flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-white">
                    AI Booking & Receipt Scanner
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    Multimodal Optical Extraction
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowScannerModal(false);
                  setScannedResult(null);
                }}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#E5C578] bg-white/[0.02] text-center space-y-3 cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#E5C578] shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-serif text-sm font-medium text-white">
                    Drop or Browse Screenshot / PDF Image
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Airline tickets, hotel vouchers, train passes
                  </p>
                </div>
                <span className="inline-block px-3 py-1 bg-white/[0.04] border border-white/10 rounded-xl text-[10px] font-mono font-bold text-white">
                  Select Image File
                </span>
              </div>

              {/* Scanned result success card */}
              {scannedResult && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Booking Extracted & Synced Successfully!</span>
                  </div>
                  <div className="text-xs text-stone-200">
                    <strong>{scannedResult.title}</strong> ({scannedResult.confirmationCode}) • {formatCurrency(scannedResult.cost || 0, baseCurrency)}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-[#0D0F15] flex items-center justify-end">
              <button
                onClick={() => {
                  setShowScannerModal(false);
                  setScannedResult(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MANUAL ADD BOOKING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="luxury-card-elevated rounded-3xl max-w-md w-full border-white/20 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0D0F15]">
              <h3 className="font-serif text-lg font-medium text-white">
                Add Travel Booking
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSave} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                  Booking Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flight IndiGo 6E-204"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                    Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DocumentType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none"
                  >
                    <option value="flight">Flight</option>
                    <option value="hotel">Hotel & Stay</option>
                    <option value="train">Train / Rail</option>
                    <option value="car">Car Rental</option>
                    <option value="ticket">Ticket / Pass</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="e.g. MakeMyTrip, Airlines"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                    Confirmation Code / PNR
                  </label>
                  <input
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    placeholder="e.g. 883921"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-mono text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                    Cost ({baseCurrency})
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                  Seat / Room / Notes
                </label>
                <input
                  type="text"
                  value={seatOrRoom}
                  onChange={(e) => setSeatOrRoom(e.target.value)}
                  placeholder="e.g. Seat 12A or Deluxe King"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
