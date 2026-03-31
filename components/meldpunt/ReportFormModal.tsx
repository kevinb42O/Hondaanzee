import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Send, ShieldAlert, X } from 'lucide-react';
import { CITIES } from '../../cityData.ts';
import { createReportInputSchema } from '../../shared/reportSchema.ts';
import type { ObservedPreset, ReportCategory } from '../../types.ts';
import { REPORT_CATEGORY_META } from '../../utils/reportHelpers.ts';
import { submitReport } from '../../utils/reportData.ts';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (detailPath: string) => void;
}

const initialState = {
  category: 'gif' as ReportCategory,
  city_slug: 'oostende',
  location_text: '',
  description: '',
  observed_preset: 'now' as ObservedPreset,
  observed_custom_at: '',
  confirm_no_personal_data: false,
};

const observedPresetLabels: Record<ObservedPreset, string> = {
  now: 'Nu',
  'today-earlier': 'Eerder vandaag',
  yesterday: 'Gisteren',
  custom: 'Zelf kiezen',
};

const ReportFormModal: React.FC<ReportFormModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formValues, setFormValues] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const categoryOptions = useMemo(
    () => Object.entries(REPORT_CATEGORY_META) as Array<[ReportCategory, { label: string }]>,
    [],
  );

  if (!isOpen) {
    return null;
  }

  const setField = <K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const parsed = createReportInputSchema.safeParse(formValues);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === 'string' && !nextErrors[path]) {
          nextErrors[path] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { detail_path } = await submitReport(parsed.data);
      setFormValues(initialState);
      setFieldErrors({});
      onSubmitted(detail_path);
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'De melding kon niet worden verstuurd.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[9999] m-auto w-full max-w-3xl rounded-[2rem] bg-transparent p-4 sm:p-6 backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm"
      aria-label="Melding maken"
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[90svh] overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2.5 text-slate-700 transition hover:bg-slate-200"
          aria-label="Sluiten"
        >
          <X size={20} />
        </button>

        <div className="max-h-[90svh] overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
          <div className="mb-6 pr-12">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-700">
              <ShieldAlert size={14} />
              Meldpunt Gif & Overlast
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Nieuwe melding</h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
              Meld alleen wat je zelf hebt gezien. Geen namen, telefoonnummers, nummerplaten of beschuldigingen over personen.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Categorie</span>
                <select
                  value={formValues.category}
                  onChange={(event) => setField('category', event.target.value as ReportCategory)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
                >
                  {categoryOptions.map(([category, meta]) => (
                    <option key={category} value={category}>
                      {meta.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && <p className="mt-2 text-sm font-medium text-red-700">{fieldErrors.category}</p>}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Kuststad</span>
                <select
                  value={formValues.city_slug}
                  onChange={(event) => setField('city_slug', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
                >
                  {CITIES.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.city_slug && <p className="mt-2 text-sm font-medium text-red-700">{fieldErrors.city_slug}</p>}
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Locatie</span>
              <input
                type="text"
                value={formValues.location_text}
                onChange={(event) => setField('location_text', event.target.value)}
                maxLength={140}
                placeholder="Ter hoogte van strandpaal 12"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              />
              {fieldErrors.location_text && <p className="mt-2 text-sm font-medium text-red-700">{fieldErrors.location_text}</p>}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Wat heb je gezien?</span>
              <textarea
                rows={5}
                value={formValues.description}
                onChange={(event) => setField('description', event.target.value)}
                maxLength={600}
                placeholder="Beschrijf kort wat er lag of gebeurde, zonder persoonsgegevens te delen."
                className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
                <span>Hou het feitelijk en concreet.</span>
                <span>{formValues.description.length}/600</span>
              </div>
              {fieldErrors.description && <p className="mt-2 text-sm font-medium text-red-700">{fieldErrors.description}</p>}
            </label>

            <div>
              <span className="mb-2 block text-sm font-bold text-slate-700">Wanneer heb je dit gezien?</span>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {(Object.keys(observedPresetLabels) as ObservedPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setField('observed_preset', preset)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                      formValues.observed_preset === preset
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50'
                    }`}
                  >
                    {observedPresetLabels[preset]}
                  </button>
                ))}
              </div>
              {formValues.observed_preset === 'custom' && (
                <div className="mt-3">
                  <input
                    type="datetime-local"
                    value={formValues.observed_custom_at}
                    onChange={(event) => setField('observed_custom_at', event.target.value)}
                    max={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </div>
              )}
              {fieldErrors.observed_custom_at && <p className="mt-2 text-sm font-medium text-red-700">{fieldErrors.observed_custom_at}</p>}
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <input
                type="checkbox"
                checked={formValues.confirm_no_personal_data}
                onChange={(event) => setField('confirm_no_personal_data', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm font-medium leading-relaxed text-slate-700">
                Ik bevestig dat deze melding geen namen, telefoonnummers, nummerplaten, contactgegevens of beschuldigingen over personen bevat.
              </span>
            </label>
            {fieldErrors.confirm_no_personal_data && <p className="text-sm font-medium text-red-700">{fieldErrors.confirm_no_personal_data}</p>}

            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {submitError}
              </div>
            )}

            <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50 px-4 py-4 text-sm font-medium leading-relaxed text-sky-900">
              Voor acute gevaren, vergiftiging of dringende interventie: contacteer meteen de lokale hulpdiensten of bevoegde stadsdiensten. Dit meldpunt is geen officieel noodkanaal.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-4 text-base font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Melding versturen...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Melding plaatsen
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </dialog>,
    document.body,
  );
};

export default ReportFormModal;
