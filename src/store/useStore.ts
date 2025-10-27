import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subscription, Member } from '../types';
import dayjs from 'dayjs';
import { generateUUID } from '../utils/uuid';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  subscriptions: Subscription[];
  members: Member[];
  notes: Note[];
  userName: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notifications: boolean;
  autoRenew: boolean;
  sortBy: 'name' | 'price' | 'nextCharge';
  isLoading: boolean;

  loadSubscriptions: () => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  duplicateSubscription: (id: string) => void;
  togglePause: (id: string) => void;

  addMember: (member: Member) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  setNotes: (notes: Note[]) => void;

  markAsPaid: (subscriptionId: string, month: string, paidBy: string) => void;
  skipPayment: (subscriptionId: string) => void;
  forcePayerThisMonth: (subscriptionId: string, memberId: string) => void;
  updateRotationOrder: (subscriptionId: string, newOrder: string[]) => void;
  addParticipantToRotation: (subscriptionId: string, participant: { id: string; name: string; color: string }) => void;
  removeParticipantFromRotation: (subscriptionId: string, participantId: string) => void;

  setUserName: (name: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  setCurrency: (currency: string) => void;
  toggleNotifications: () => void;
  toggleAutoRenew: () => void;
  setSortBy: (sortBy: 'name' | 'price' | 'nextCharge') => void;
  resetData: () => void;
}

const defaultMembers: Member[] = [];
const defaultSubscriptions: Subscription[] = [];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      subscriptions: defaultSubscriptions,
      members: defaultMembers,
      notes: [],
      userName: '',
      theme: 'system',
      currency: 'EUR',
      notifications: true,
      autoRenew: true,
      sortBy: 'nextCharge',
      isLoading: false,

      loadSubscriptions: () => {
        // Not needed - zustand persist handles loading
      },

      setSubscriptions: (subscriptions) => {
        set({ subscriptions });
      },

      addSubscription: (subscription) => {
        set((state) => ({
          subscriptions: [...state.subscriptions, subscription],
        }));
      },

      updateSubscription: (id, updates) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updates } : sub
          ),
        }));
      },

      deleteSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        }));
      },

      duplicateSubscription: (id) =>
        set((state) => {
          const sub = state.subscriptions.find((s) => s.id === id);
          if (!sub) return state;
          const newSub = {
            ...sub,
            id: generateUUID(),
            name: `${sub.name} (copie)`,
          };
          return { subscriptions: [...state.subscriptions, newSub] };
        }),

      togglePause: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, isPaused: !sub.isPaused } : sub
          ),
        }));
      },

      addMember: (member) =>
        set((state) => ({
          members: [...state.members, member],
        })),

      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, ...updates } : member
          ),
        })),

      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        })),

      setNotes: (notes) =>
        set({ notes }),

      markAsPaid: (subscriptionId, month, paidBy) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id !== subscriptionId || !sub.rotation) return sub;

            const history = sub.history || [];
            const existingEntry = history.find((h) => h.month === month);

            if (existingEntry) {
              return {
                ...sub,
                history: history.map((h) =>
                  h.month === month ? { ...h, paidBy } : h
                ),
              };
            }

            const newIndex = (sub.rotation.currentIndex + 1) % sub.rotation.order.length;

            return {
              ...sub,
              rotation: { ...sub.rotation, currentIndex: newIndex },
              history: [...history, { month, paidBy }],
            };
          }),
        })),

      skipPayment: (subscriptionId) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id !== subscriptionId || !sub.rotation) return sub;

            const newIndex = (sub.rotation.currentIndex + 1) % sub.rotation.order.length;

            return {
              ...sub,
              rotation: { ...sub.rotation, currentIndex: newIndex },
            };
          }),
        })),

      forcePayerThisMonth: (subscriptionId, memberId) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id !== subscriptionId || !sub.rotation) return sub;

            const month = dayjs().format('YYYY-MM');
            const overrides = { ...sub.rotation.overrides, [month]: memberId };

            return {
              ...sub,
              rotation: { ...sub.rotation, overrides },
            };
          }),
        })),

      updateRotationOrder: (subscriptionId, newOrder) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id !== subscriptionId || !sub.rotation) return sub;

            let newIndex = sub.rotation.currentIndex;
            const currentPayerId = sub.rotation.order[sub.rotation.currentIndex];
            const newCurrentIndex = newOrder.indexOf(currentPayerId);
            if (newCurrentIndex !== -1) {
              newIndex = newCurrentIndex;
            }

            return {
              ...sub,
              rotation: { ...sub.rotation, order: newOrder, currentIndex: newIndex },
              participants: newOrder,
            };
          }),
        })),

      addParticipantToRotation: (subscriptionId, participant) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id !== subscriptionId) return sub;

            const newOrder = sub.rotation ? [...sub.rotation.order, participant.id] : [participant.id];
            const newParticipants = [...(sub.participants || []), participant.id];

            return {
              ...sub,
              participants: newParticipants,
              rotation: sub.rotation
                ? { ...sub.rotation, order: newOrder }
                : { order: newOrder, currentIndex: 0, startDate: dayjs().toISOString() },
            };
          }),
        })),

      removeParticipantFromRotation: (subscriptionId, participantId) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id !== subscriptionId || !sub.rotation) return sub;

            const newOrder = sub.rotation.order.filter((id) => id !== participantId);
            const newParticipants = (sub.participants || []).filter((id) => id !== participantId);

            if (newOrder.length === 0) {
              return {
                ...sub,
                participants: newParticipants,
                rotation: undefined,
              };
            }

            let newIndex = sub.rotation.currentIndex;
            if (newIndex >= newOrder.length) {
              newIndex = 0;
            }

            return {
              ...sub,
              participants: newParticipants,
              rotation: { ...sub.rotation, order: newOrder, currentIndex: newIndex },
            };
          }),
        })),

      setUserName: (name) =>
        set({ userName: name }),

      setTheme: (theme) =>
        set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setCurrency: (currency) =>
        set({ currency }),

      toggleNotifications: () =>
        set((state) => ({
          notifications: !state.notifications,
        })),

      toggleAutoRenew: () =>
        set((state) => ({
          autoRenew: !state.autoRenew,
        })),

      setSortBy: (sortBy) =>
        set({ sortBy }),

      resetData: () =>
        set({
          subscriptions: defaultSubscriptions,
          members: defaultMembers,
        }),
    }),
    {
      name: 'fluxy-storage',
      partialize: (state) => ({
        subscriptions: state.subscriptions,
        members: state.members,
        notes: state.notes,
        userName: state.userName,
        theme: state.theme,
        currency: state.currency,
        notifications: state.notifications,
        autoRenew: state.autoRenew,
        sortBy: state.sortBy,
      }),
    }
  )
);
