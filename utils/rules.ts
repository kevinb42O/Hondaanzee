import type { City, StatusValue } from '../types.ts';

const formatDateKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

export interface EvaluatedRuleStatus {
  status: StatusValue;
  rule: string;
  label: string;
}

export const evaluateCityRuleStatus = (city: City, now: Date = new Date()): EvaluatedRuleStatus => {
  const currentDateStr = formatDateKey(now);
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const { rules } = city;

  const override = rules.overrides?.find(period => currentDateStr >= period.start && currentDateStr <= period.end);
  if (override) {
    return {
      status: override.status,
      rule: override.rule,
      label: override.label ?? 'Opgelet: Speciale regeling',
    };
  }

  const summer = rules.summer;
  if (summer && currentDateStr >= summer.start && currentDateStr <= summer.end) {
    let label = 'Opgelet: Zomerregeling';

    if (summer.startTime && summer.endTime && currentTimeStr >= summer.startTime && currentTimeStr <= summer.endTime) {
      label = `Zomerregeling (${summer.startTime}-${summer.endTime})`;
    }

    return {
      status: summer.status,
      rule: summer.rule,
      label,
    };
  }

  return {
    status: rules.winter.status,
    rule: rules.winter.rule,
    label: 'Vrije toegang: Winterregeling',
  };
};

export const getCityMapStatus = (city: City, now: Date = new Date()): StatusValue => {
  return evaluateCityRuleStatus(city, now).status;
};