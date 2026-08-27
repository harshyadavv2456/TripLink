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

// Demo sample booking receipts for 1-click test
const SAMPLE_BOOKINGS = [
  {
    name: 'MakeMyTrip Air Flight Ticket',
    provider: 'MakeMyTrip / IndiGo',
    type: 'flight' as DocumentType,
    title: 'Flight 6E-204: DEL → NRT (Tokyo)',
    confirmationCode: 'MMT-IND-88294',
    date: '2026-09-15',
    cost: 540,
    seatOrRoom: 'Seat 14F (Window)',
    notes: 'Baggage included: 25kg checked, 7kg cabin. Terminal 3 Departure.',
  },
  {
    name: 'Booking.com Tokyo Hotel',
    provider: 'Booking.com',
    type: 'hotel' as DocumentType,
    title: 'Hotel Gracery Shinjuku (4 Nights)',
    confirmationCode: 'BK-TOKYO-9182',
    date: '2026-09-15',
    cost: 680,
    seatOrRoom: 'Deluxe Queen Room',
    notes: 'Breakfast buffet included. Check-in 3:00 PM.',
  },
  {
    name: 'JR Shinkansen Bullet Train',
    provider: 'JR West / Klook',
    type: 'train' as DocumentType,
    title: 'Nozomi Shinkansen: Tokyo → Kyoto',
    confirmationCode: 'JR-SHK-3341',
    date: '2026-09-19',
    cost: 95,
    seatOrRoom: 'Car 4, Seat 8A',
    notes: 'Reserved ordinary seat with oversized baggage area.',
  },
];

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

  // Test with Demo Sample Receipt
  const handleAddSampleReceipt = (sample: (typeof SAMPLE_BOOKINGS)[0]) => {
    addDocument(trip.id, {
      title: sample.title,
      type: sample.type,
      confirmationCode: sample.confirmationCode,
      provider: sample.provider,
      date: sample.date,
      cost: sample.cost,
      seatOrRoom: sample.seatOrRoom,
      notes: sample.notes,
    });
    setShowScannerModal(false);
  };

  const totalBookingCost = trip.documents.reduce((s, d) => s + (d.cost || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
              Logistics & Confirmations
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <FileText className="w-5 h-5 text-[#1A1A1A]" />
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A]">
                Bookings & Travel Documents
              </h2>
            </div>
            <p className="text-xs text-[#8C8881] mt-1">
              Upload MakeMyTrip, airline, or hotel screenshots — Gemini AI automatically extracts your confirmation codes and syncs expenses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-[#FDFCFB] px-3.5 py-2 rounded-xl border border-[#E5E1DA] text-xs">
              <span className="text-[#8C8881] block uppercase font-bold text-[9px] tracking-wider">Total Pre-Booked</span>
              <span className="font-mono text-sm font-bold text-[#1A1A1A]">
                {formatCurrency(totalBookingCost, baseCurrency)}
              </span>
            </div>

            {/* AI Screenshot Scanner Button */}
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-amber-700" />
              <span>AI Screenshot Scan</span>
            </button>

            {/* Manual Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {trip.documents.map((doc) => {
          const cfg = DOC_CONFIG[doc.type] || DOC_CONFIG.other;
          const Icon = cfg.icon;
          const isCopied = copiedCode === doc.confirmationCode;

          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl p-5 border border-[#E5E1DA] shadow-xs hover:border-[#1A1A1A] transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border border-[#E5E1DA] bg-[#FDFCFB] text-[#1A1A1A]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C8881]">
                        {cfg.label} • {doc.provider || 'Confirmed'}
                      </span>
                      <h3 className="font-serif text-base font-light text-[#1A1A1A] leading-snug">
                        {doc.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteDocument(trip.id, doc.id)}
                    className="p-1 rounded-lg text-[#8C8881] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Confirmation Code Copy Pill */}
                {doc.confirmationCode && (
                  <div className="bg-[#FDFCFB] p-2.5 rounded-lg border border-[#E5E1DA] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-[#8C8881] font-bold block">
                        Confirmation / PNR
                      </span>
                      <span className="font-mono text-xs font-bold text-[#1A1A1A] tracking-wider">
                        {doc.confirmationCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(doc.confirmationCode!)}
                      className="px-2.5 py-1 rounded-md bg-white border border-[#E5E1DA] text-[10px] font-bold text-[#1A1A1A] hover:bg-stone-100 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#8C8881]" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Details list */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {doc.date && (
                    <div className="flex items-center gap-1.5 text-[#8C8881]">
                      <Calendar className="w-3.5 h-3.5 text-[#8C8881]" />
                      <span className="text-[11px]">{doc.date}</span>
                    </div>
                  )}

                  {doc.seatOrRoom && (
                    <div className="text-[11px] text-[#1A1A1A] font-medium text-right">
                      {doc.seatOrRoom}
                    </div>
                  )}
                </div>

                {doc.notes && (
                  <p className="text-[11px] text-[#8C8881] bg-[#FDFCFB] p-2 rounded-lg border border-[#E5E1DA] leading-relaxed">
                    {doc.notes}
                  </p>
                )}
              </div>

              {/* Cost footer */}
              <div className="pt-2 border-t border-[#E5E1DA] flex items-center justify-between text-xs">
                <span className="text-[#8C8881] text-[10px] uppercase font-bold tracking-wider">
                  Cost
                </span>
                <span className="font-mono text-xs font-bold text-[#1A1A1A]">
                  {doc.cost && doc.cost > 0 ? formatCurrency(doc.cost, baseCurrency) : 'Pre-paid'}
                </span>
              </div>
            </div>
          );
        })}

        {trip.documents.length === 0 && (
          <div className="col-span-full p-8 rounded-2xl bg-[#FDFCFB] border border-dashed border-[#E5E1DA] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E1DA] flex items-center justify-center mx-auto text-[#8C8881]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-base font-medium text-[#1A1A1A]">No Bookings Added Yet</h4>
              <p className="text-xs text-[#8C8881] max-w-sm mx-auto">
                Scan your flight tickets, MakeMyTrip vouchers, or hotel confirmations to keep all confirmation codes in one safe vault.
              </p>
            </div>
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Booking Screenshot</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          AI BOOKING SCANNER MODAL (Multimodal Gemini 3.7 Flash)
         ========================================================================= */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E1DA] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-[#E5E1DA] flex items-center justify-between bg-[#FDFCFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
                    AI Booking & Receipt Scanner
                  </h3>
                  <p className="text-xs text-[#8C8881]">
                    Powered by Multimodal Gemini 3.7 Flash
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowScannerModal(false);
                  setScannedResult(null);
                }}
                className="p-1.5 text-[#8C8881] hover:text-[#1A1A1A] rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-[#E5E1DA] hover:border-[#1A1A1A] bg-[#FDFCFB] text-center space-y-3 cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-white border border-[#E5E1DA] flex items-center justify-center mx-auto text-[#1A1A1A] shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-serif text-sm font-medium text-[#1A1A1A]">
                    Drop or Browse Screenshot / PDF Image
                  </p>
                  <p className="text-xs text-[#8C8881] mt-0.5">
                    MakeMyTrip, Booking.com, Airbnb, IndiGo, British Airways tickets
                  </p>
                </div>
                <span className="inline-block px-3 py-1 bg-white border border-[#E5E1DA] rounded-lg text-[10px] font-mono font-bold text-[#1A1A1A]">
                  Select Image File
                </span>
              </div>

              {/* Scanned result success card */}
              {scannedResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Booking Extracted & Synced Successfully!</span>
                  </div>
                  <div className="text-xs text-emerald-900">
                    <strong>{scannedResult.title}</strong> ({scannedResult.confirmationCode}) • {formatCurrency(scannedResult.cost || 0, baseCurrency)}
                  </div>
                </div>
              )}

              {/* 1-Click Demo Samples */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881] block">
                  Or Test with Real Sample Booking Data
                </span>

                <div className="space-y-2">
                  {SAMPLE_BOOKINGS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddSampleReceipt(sample)}
                      className="w-full p-3 rounded-xl bg-[#FDFCFB] border border-[#E5E1DA] hover:border-[#1A1A1A] flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-[#8C8881]">
                          {sample.provider}
                        </span>
                        <h5 className="font-serif text-xs font-medium text-[#1A1A1A]">
                          {sample.title}
                        </h5>
                        <p className="text-[10px] font-mono text-stone-500">
                          PNR: {sample.confirmationCode} • {formatCurrency(sample.cost, baseCurrency)}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                        Add <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E5E1DA] bg-[#FDFCFB] flex items-center justify-end">
              <button
                onClick={() => {
                  setShowScannerModal(false);
                  setScannedResult(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MANUAL ADD BOOKING MODAL
         ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E5E1DA] shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E5E1DA] flex items-center justify-between bg-[#FDFCFB]">
              <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
                Add Travel Booking
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[#8C8881] hover:text-[#1A1A1A] rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSave} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                  Booking Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flight IndiGo 6E-204"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                    Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DocumentType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs focus:outline-none focus:border-[#1A1A1A] bg-white"
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
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="e.g. MakeMyTrip"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                    Confirmation Code / PNR
                  </label>
                  <input
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    placeholder="e.g. 883921"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs font-mono focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                    Cost ({baseCurrency})
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs font-mono focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                  Seat / Room / Notes
                </label>
                <input
                  type="text"
                  value={seatOrRoom}
                  onChange={(e) => setSeatOrRoom(e.target.value)}
                  placeholder="e.g. Seat 12A or Deluxe King"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold cursor-pointer"
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
