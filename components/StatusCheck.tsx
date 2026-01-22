
import React, { useMemo } from 'react';
import { Calendar, Info, MapPin, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import { City } from '../types';

interface StatusCheckProps {
  city: City;
}

const StatusCheck: React.FC<StatusCheckProps> = ({ city }) => {
  const statusInfo = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    const rules = city.rules;
    const summer = rules.summer;

    let activeRule = rules.winter.rule;
    let activeStatus = rules.winter.status;
    let label = 'Vrije toegang: Winterregeling';

    if (summer && currentDateStr >= summer.start && currentDateStr <= summer.end) {
      activeRule = summer.rule;
      activeStatus = summer.status;
      label = 'Opgelet: Zomerregeling';

      if (summer.startTime && summer.endTime) {
        if (currentTimeStr >= summer.startTime && currentTimeStr <= summer.endTime) {
          activeStatus = 'NEE';
          label = `Beperkt tussen ${summer.startTime} en ${summer.endTime}`;
        }
      }
    }

    const config = {
      JA: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" /> },
      DEELS: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: <AlertCircle className="w-10 h-10 md:w-12 md:h-12" /> },
      NEE: { color: 'text-rose-600 bg-rose-50 border-rose-200', icon: <XCircle className="w-10 h-10 md:w-12 md:h-12" /> }
    };

    return {
      status: activeStatus,
      ...config[activeStatus],
      rule: activeRule,
      label
    };
  }, [city]);

  return (
    <div className="max-w-3xl mx-auto px-1 sm:px-0">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] md:text-xs font-bold mb-3 sm:mb-4 uppercase tracking-widest border border-slate-200">
          <MapPin size={12} className="text-sky-600 sm:w-[14px] sm:h-[14px]" /> {city.name}, België
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-slate-900 leading-[1.15] mb-3 sm:mb-4 px-2">
          Mag mijn hond <span className="text-sky-600 underline decoration-sky-300 decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8">nu</span> op het strand?
        </h1>
      </div>

      <div className={`p-5 sm:p-6 md:p-10 lg:p-14 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] border-2 shadow-xl shadow-slate-200/50 transition-all duration-300 ${statusInfo.color}`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 sm:mb-4 md:mb-6">
            {statusInfo.icon}
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-black mb-1 md:mb-2 opacity-80 flex items-center gap-1.5 sm:gap-2">
            <Clock size={10} className="sm:w-3 sm:h-3" /> {statusInfo.label}
          </span>
          <div className="text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black leading-none mb-3 sm:mb-4 md:mb-8 tracking-tighter">
            {statusInfo.status}
          </div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-relaxed max-w-lg text-slate-800 px-2">
            {statusInfo.rule}
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-3xl border border-slate-200 flex items-center sm:items-start gap-3 sm:gap-4 shadow-sm active:bg-slate-50 transition-colors">
          <div className="bg-sky-50 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-sky-600 h-fit shrink-0">
            <Calendar size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm md:text-base mb-0.5">Vandaag</h3>
            <p className="text-slate-500 text-xs sm:text-[13px] md:text-sm capitalize font-medium truncate">
              {new Intl.DateTimeFormat('nl-BE', { dateStyle: 'full' }).format(new Date())}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-3xl border border-slate-200 flex items-center sm:items-start gap-3 sm:gap-4 shadow-sm active:bg-slate-50 transition-colors">
          <div className="bg-amber-50 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-amber-600 h-fit shrink-0">
            <Info size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm md:text-base mb-0.5">Zeedijk</h3>
            <p className="text-slate-500 text-xs sm:text-[13px] md:text-sm font-medium leading-tight">Het hele jaar welkom aan de leiband.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCheck;
