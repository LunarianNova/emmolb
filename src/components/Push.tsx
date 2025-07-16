// Don't touch this file for all this is holy
const SERVICE_WORKER_FILE_PATH = './sw.js';

export function notificationUnsupported(): boolean {
  const isIos = /iP(ad|hone|od)/.test(navigator.userAgent);
  return (
    isIos ||
    !(
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'showNotification' in ServiceWorkerRegistration.prototype
    )
  );
}

export function checkPermissionStateAndAct(
  onSubscribe: (subs: PushSubscription | null) => void,
): void {
  const state: NotificationPermission = Notification.permission;
  if (state === 'granted') {
    registerAndSubscribe(onSubscribe);
  }
}

async function subscribeOnce(
  onSubscribe: (subs: PushSubscription | null) => void,
): Promise<void> {
  navigator.serviceWorker.ready
    .then((registration: ServiceWorkerRegistration) => {
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VAPID_PUBLIC_KEY,
      });
    })
    .then((subscription: PushSubscription) => {
      console.info('Created subscription object:', subscription.toJSON());
      onSubscribe(subscription);
    })
    .catch(e => {
      console.error('Failed to subscribe:', e);
    });
}

export async function isSubscribed(teamId: string): Promise<boolean> {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  const endpoint = sub?.endpoint;

  if (!endpoint) return false;

  const res = await fetch('https://lunanova.space/cgi-bin/is_subscribed.py', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_id: teamId, endpoint }),
  });

  const { subscribed } = await res.json();
  return subscribed;
}

export async function subscribeToTeam(teamId: string) {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;
  const existingSub = await reg.pushManager.getSubscription();
  const sub = existingSub || await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.VAPID_PUBLIC_KEY,
  });

  await fetch('https://lunanova.space/cgi-bin/subscribe.py', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      team_id: teamId,
      subscription: sub.toJSON(),
    }),
  });
}

export async function unsubscribeFromTeam(teamId: string) {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  const endpoint = sub?.endpoint;

  if (!endpoint) return;

  await fetch('https://lunanova.space/cgi-bin/unsubscribe.py', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_id: teamId, endpoint }),
  });
}

export async function registerAndSubscribe(onSubscribe: (subs: PushSubscription | null) => void): Promise<void> {
    try {
        await navigator.serviceWorker.register(SERVICE_WORKER_FILE_PATH);
        await subscribeOnce(onSubscribe);
    } catch (e) {
        console.error('Failed to register service worker:', e);
    }
}