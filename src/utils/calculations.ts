import { Subscription, BillingCycle, Member } from '../types';
import dayjs from 'dayjs';

export const toMonthlyEquivalent = (price: number, cycle: BillingCycle): number => {
  switch (cycle) {
    case 'monthly':
      return price;
    case 'annual':
      return price / 12;
    case 'weekly':
      return (price * 52) / 12;
    default:
      return price;
  }
};

export const toAnnualEquivalent = (price: number, cycle: BillingCycle): number => {
  return toMonthlyEquivalent(price, cycle) * 12;
};

export const toWeeklyEquivalent = (price: number, cycle: BillingCycle): number => {
  return (toMonthlyEquivalent(price, cycle) * 12) / 52;
};

export const getTotalMonthly = (subscriptions: Subscription[]): number => {
  return subscriptions
    .filter((sub) => !sub.isPaused)
    .reduce((total, sub) => total + toMonthlyEquivalent(sub.price, sub.billing), 0);
};

export const getTotalAnnual = (subscriptions: Subscription[]): number => {
  return getTotalMonthly(subscriptions) * 12;
};

export const getDaysUntilNextCharge = (nextCharge: string): number => {
  return dayjs(nextCharge).diff(dayjs(), 'day');
};

export const getCurrentPayer = (
  subscription: Subscription,
  month?: string
): string | null => {
  if (!subscription.rotation || !subscription.participants) return null;

  const targetMonth = month || dayjs().format('YYYY-MM');

  if (subscription.rotation.overrides?.[targetMonth]) {
    return subscription.rotation.overrides[targetMonth];
  }

  return subscription.rotation.order[subscription.rotation.currentIndex];
};

export const getNextPayer = (subscription: Subscription): string | null => {
  if (!subscription.rotation || !subscription.participants) return null;

  const nextIndex =
    (subscription.rotation.currentIndex + 1) % subscription.rotation.order.length;

  return subscription.rotation.order[nextIndex];
};

export const calculateBalances = (
  subscriptions: Subscription[],
  members: Member[],
  periodMonths: number = 12
): Record<string, { owed: number; paid: number; balance: number; paymentCount: number }> => {
  const balances: Record<
    string,
    { owed: number; paid: number; balance: number; paymentCount: number }
  > = {};

  members.forEach((member) => {
    balances[member.id] = { owed: 0, paid: 0, balance: 0, paymentCount: 0 };
  });

  const startMonth = dayjs().subtract(periodMonths, 'month');

  subscriptions
    .filter((sub) => sub.familial && sub.rotation && sub.history)
    .forEach((sub) => {
      const monthlyPrice = toMonthlyEquivalent(sub.price, sub.billing);
      const paymentMode = sub.paymentMode || 'rotation';

      sub.history!.forEach((entry) => {
        const entryDate = dayjs(entry.month, 'YYYY-MM');
        if (entryDate.isBefore(startMonth)) return;

        if (balances[entry.paidBy]) {
          balances[entry.paidBy].paid += monthlyPrice;
          balances[entry.paidBy].paymentCount += 1;
        }
      });

      const totalParticipants = sub.participants?.length || 0;
      if (totalParticipants === 0) return;

      const relevantMonths = sub.history!.filter((entry) => {
        const entryDate = dayjs(entry.month, 'YYYY-MM');
        return entryDate.isAfter(startMonth) || entryDate.isSame(startMonth);
      }).length;

      if (paymentMode === 'rotation') {
        const fairPaymentCount = relevantMonths / totalParticipants;
        sub.participants!.forEach((memberId) => {
          if (balances[memberId]) {
            balances[memberId].owed += fairPaymentCount * monthlyPrice;
          }
        });
      } else {
        const totalShares = sub.participants!.reduce(
          (sum, id) => sum + (sub.shares?.[id] || 1),
          0
        );

        sub.participants!.forEach((memberId) => {
          if (balances[memberId]) {
            const memberShare = (sub.shares?.[memberId] || 1) / totalShares;
            balances[memberId].owed += monthlyPrice * memberShare * relevantMonths;
          }
        });
      }
    });

  Object.keys(balances).forEach((memberId) => {
    balances[memberId].balance =
      balances[memberId].paid - balances[memberId].owed;
  });

  return balances;
};

export const getCategoryTotals = (
  subscriptions: Subscription[]
): Record<string, number> => {
  const totals: Record<string, number> = {};

  subscriptions
    .filter((sub) => !sub.isPaused)
    .forEach((sub) => {
      const monthly = toMonthlyEquivalent(sub.price, sub.billing);
      totals[sub.category] = (totals[sub.category] || 0) + monthly;
    });

  return totals;
};

export const getUpcomingCharges = (
  subscriptions: Subscription[],
  days: number = 30
): Subscription[] => {
  const cutoff = dayjs().add(days, 'day');

  return subscriptions
    .filter((sub) => !sub.isPaused && dayjs(sub.nextCharge).isBefore(cutoff))
    .sort((a, b) => dayjs(a.nextCharge).diff(dayjs(b.nextCharge)));
};
