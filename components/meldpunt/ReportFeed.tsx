import React from 'react';
import { MessageSquareOff } from 'lucide-react';
import type { ReportItem } from '../../types.ts';
import ReportCard from './ReportCard.tsx';

interface ReportFeedProps {
  reports: ReportItem[];
  onFlag: (publicId: string) => Promise<void>;
  onConfirm: (publicId: string) => Promise<{ alreadyConfirmed: boolean }>;
}

const ReportFeed: React.FC<ReportFeedProps> = ({ reports, onFlag, onConfirm }) => {
  if (reports.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <MessageSquareOff size={28} />
        </div>
        <h2 className="text-xl font-black tracking-tight text-slate-900">Nog geen zichtbare meldingen</h2>
        <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
          Zodra er een melding binnenkomt, verschijnt ze hier in het publieke kustoverzicht.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onFlag={onFlag} onConfirm={onConfirm} />
      ))}
    </div>
  );
};

export default ReportFeed;
