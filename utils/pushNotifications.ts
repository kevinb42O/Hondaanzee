// Web Push helpers — subscribe / unsubscribe the current browser to push notifications.
// VAPID public key is read from VITE_VAPID_PUBLIC_KEY at build time.
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabasePublicConfig.ts';

export const VAPID_PUBLIC_KEY: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_VAPID_PUBLIC_KEY || '';

export type PushPermission = NotificationPermission | 'unsupported';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) output[i] = rawData.charCodeAt(i);
  return output;
};

export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

export const getPushPermission = (): PushPermission => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
};

const getRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg || null;
};

export const getCurrentSubscription = async (): Promise<PushSubscription | null> => {
  if (!isPushSupported()) return null;
  const reg = await getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
};

const postJSON = async (path: string, body: Record<string, unknown>) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let message = `Request mislukt (${response.status}).`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return response.json();
};

const subscriptionToJSON = (sub: PushSubscription) => {
  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  return {
    endpoint: json.endpoint || sub.endpoint,
    keys: {
      p256dh: json.keys?.p256dh || '',
      auth: json.keys?.auth || '',
    },
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
};

export const subscribeToPush = async (): Promise<PushSubscription> => {
  if (!isPushSupported()) throw new Error('Push notificaties niet ondersteund op dit toestel.');
  if (!VAPID_PUBLIC_KEY) throw new Error('Push is niet geconfigureerd (ontbrekende VAPID-sleutel).');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Toestemming geweigerd. Sta notificaties toe in je browserinstellingen.');
  }

  const reg = await getRegistration();
  if (!reg) throw new Error('Service worker niet beschikbaar.');

  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  await postJSON('subscribe-push', subscriptionToJSON(subscription));
  return subscription;
};

export const unsubscribeFromPush = async (): Promise<void> => {
  const subscription = await getCurrentSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  try {
    await subscription.unsubscribe();
  } catch { /* ignore */ }
  try {
    await postJSON('unsubscribe-push', { endpoint });
  } catch { /* ignore — local unsubscribe already done */ }
};
