import dayjs from 'dayjs';
import { Subscription } from '../types';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const scheduleNotification = (
  subscription: Subscription,
  currentPayerName: string,
  daysBeforeCharge: number = 3
) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const chargeDate = dayjs(subscription.nextCharge);
  const notificationDate = chargeDate.subtract(daysBeforeCharge, 'day');
  const now = dayjs();

  if (notificationDate.isAfter(now)) {
    const delay = notificationDate.diff(now, 'millisecond');

    setTimeout(() => {
      new Notification(`Paiement à venir: ${subscription.name}`, {
        body: `${currentPayerName}, c'est à ton tour de payer ${subscription.price}€ dans ${daysBeforeCharge} jours`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `payment-${subscription.id}`,
        requireInteraction: true,
      });
    }, delay);
  }
};

export const checkUpcomingPayments = (
  subscriptions: Subscription[],
  members: { id: string; name: string }[],
  currentUserId: string,
  userName: string
) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const now = dayjs();

  subscriptions
    .filter((sub) => sub.familial && sub.rotation && !sub.isPaused)
    .forEach((sub) => {
      const chargeDate = dayjs(sub.nextCharge);
      const daysUntilCharge = chargeDate.diff(now, 'day');

      const currentPayerId = sub.rotation!.order[sub.rotation!.currentIndex];

      if (currentPayerId === currentUserId && daysUntilCharge <= 3 && daysUntilCharge >= 0) {
        const paymentMode = sub.paymentMode || 'rotation';
        const message = paymentMode === 'rotation'
          ? `C'est ton tour de payer ${sub.price}€`
          : `Tu dois payer ta part: ${sub.price}€`;

        new Notification(`Paiement dans ${daysUntilCharge} jour${daysUntilCharge > 1 ? 's' : ''}: ${sub.name}`, {
          body: message,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `payment-reminder-${sub.id}`,
          requireInteraction: true,
        });
      }
    });
};

export const sendTestNotification = () => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  new Notification('Notifications activées!', {
    body: 'Tu recevras des rappels pour tes paiements à venir',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'test-notification',
  });

  return true;
};
