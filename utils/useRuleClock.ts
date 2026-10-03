import { useEffect, useState } from 'react';
import { CITIES } from '../cityData.ts';
import { belgianTimeInput, evaluateCityRuleStatus } from './rules.ts';

const dayInBelgium = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels', dateStyle: 'short' });
const publicRuleState = (date: Date) => dayInBelgium.format(date) + belgianTimeInput(date) + JSON.stringify(CITIES.map(city => evaluateCityRuleStatus(city, date)));
/** Null during prerender. Refresh at a rule/date change, without restarting page
 * animations every second. Returning to a background tab triggers a fresh check. */
export const useRuleClock = (): Date | null => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let lastState = '';
    const update = () => {
      const current = new Date();
      const state = publicRuleState(current);
      if (state !== lastState) { lastState = state; setNow(current); }
    };
    update();
    const timer = window.setInterval(update, 1000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return now;
};
