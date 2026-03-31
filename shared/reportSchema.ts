import { z } from 'zod';

export const REPORT_CATEGORIES = [
  'gif',
  'afval',
  'weggegooid_voorwerp',
  'hondenpoep',
  'gevaarlijke_situatie',
  'andere_overlast',
] as const;

export const REPORT_INTERVENTION_STATUSES = [
  'not_applicable',
  'pending',
  'forwarded',
  'resolved',
] as const;

export const REPORT_STATUSES = ['published', 'removed'] as const;

export const OBSERVED_PRESETS = ['now', 'today-earlier', 'yesterday', 'custom'] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type ReportInterventionStatus = (typeof REPORT_INTERVENTION_STATUSES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type ObservedPreset = (typeof OBSERVED_PRESETS)[number];

const PHONE_PATTERN = /\b(?:\+32|0032|0)\s*4\d(?:[\s./-]*\d){7,8}\b/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+\b/i;
const LICENSE_PLATE_PATTERN = /\b(?:[1-9]-[A-Z]{3}-\d{3}|[A-Z]{3}-\d{3}|[A-Z]-[A-Z]{3}-\d{3})\b/i;
const LONG_REPEAT_PATTERN = /(.)\1{5,}/i;

const sanitizedString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max);

const personalDataSafeString = (fieldName: string, min: number, max: number) =>
  sanitizedString(min, max)
    .refine((value) => !PHONE_PATTERN.test(value), `${fieldName} mag geen telefoonnummer bevatten.`)
    .refine((value) => !EMAIL_PATTERN.test(value), `${fieldName} mag geen e-mailadres bevatten.`)
    .refine((value) => !URL_PATTERN.test(value), `${fieldName} mag geen link bevatten.`)
    .refine((value) => !LICENSE_PLATE_PATTERN.test(value), `${fieldName} mag geen nummerplaat bevatten.`)
    .refine((value) => !LONG_REPEAT_PATTERN.test(value), `${fieldName} lijkt spam te bevatten.`)
    .refine((value) => !looksLikeShouting(value), `${fieldName} lijkt schreeuwerig of spammy.`)
    .transform((value) => value.replace(/\s+/g, ' ').trim());

export const createReportInputSchema = z
  .object({
    category: z.enum(REPORT_CATEGORIES, {
      error: 'Kies wat je wil melden.',
    }),
    city_slug: sanitizedString(2, 60),
    location_text: personalDataSafeString('De locatie', 6, 140),
    description: personalDataSafeString('De beschrijving', 12, 600),
    observed_preset: z.enum(OBSERVED_PRESETS, {
      error: 'Kies wanneer je dit gezien hebt.',
    }),
    observed_custom_at: z.string().trim().optional().or(z.literal('')),
    confirm_no_personal_data: z.literal(true, {
      error: 'Bevestig dat je geen persoonsgegevens of beschuldigingen deelt.',
    }),
  })
  .superRefine((value, ctx) => {
    if (value.observed_preset !== 'custom') {
      return;
    }

    if (!value.observed_custom_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['observed_custom_at'],
        message: 'Kies een datum en tijdstip.',
      });
      return;
    }

    const timestamp = Date.parse(value.observed_custom_at);
    if (Number.isNaN(timestamp)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['observed_custom_at'],
        message: 'Het gekozen tijdstip is ongeldig.',
      });
      return;
    }

    if (timestamp > Date.now() + 60_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['observed_custom_at'],
        message: 'Het tijdstip mag niet in de toekomst liggen.',
      });
    }
  });

export const flagReportInputSchema = z.object({
  public_id: sanitizedString(6, 32),
});

export const confirmReportInputSchema = z.object({
  public_id: sanitizedString(6, 32),
});

export type CreateReportInput = z.infer<typeof createReportInputSchema>;
export type FlagReportInput = z.infer<typeof flagReportInputSchema>;
export type ConfirmReportInput = z.infer<typeof confirmReportInputSchema>;

export const adminListReportsInputSchema = z.object({
  admin_key: sanitizedString(8, 200),
});

export const adminUpdateReportInputSchema = z.object({
  admin_key: sanitizedString(8, 200),
  public_id: sanitizedString(6, 32),
  city_intervention_status: z.enum(REPORT_INTERVENTION_STATUSES, {
    error: 'Kies een geldige interventiestatus.',
  }),
  city_intervention_note: z.string().trim().max(300).optional().or(z.literal('')),
});

export const adminRemoveReportInputSchema = z.object({
  admin_key: sanitizedString(8, 200),
  public_id: sanitizedString(6, 32),
});

export type AdminListReportsInput = z.infer<typeof adminListReportsInputSchema>;
export type AdminUpdateReportInput = z.infer<typeof adminUpdateReportInputSchema>;
export type AdminRemoveReportInput = z.infer<typeof adminRemoveReportInputSchema>;

export const buildObservedAt = (input: Pick<CreateReportInput, 'observed_preset' | 'observed_custom_at'>): string => {
  const now = new Date();

  switch (input.observed_preset) {
    case 'now':
      return now.toISOString();
    case 'today-earlier': {
      const earlierToday = new Date(now);
      earlierToday.setHours(Math.max(now.getHours() - 3, 0), Math.max(now.getMinutes() - 15, 0), 0, 0);
      return earlierToday.toISOString();
    }
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      yesterday.setHours(Math.min(now.getHours(), 18), 0, 0, 0);
      return yesterday.toISOString();
    }
    case 'custom':
      return new Date(input.observed_custom_at || now.toISOString()).toISOString();
    default:
      return now.toISOString();
  }
};

export const getValidationPatterns = () => ({
  phone: PHONE_PATTERN,
  email: EMAIL_PATTERN,
  url: URL_PATTERN,
  licensePlate: LICENSE_PLATE_PATTERN,
});

export const looksLikeShouting = (value: string): boolean => {
  const letters = value.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 16) return false;

  const uppercaseLetters = letters.replace(/[^A-Z]/g, '').length;
  return uppercaseLetters / letters.length > 0.72;
};
