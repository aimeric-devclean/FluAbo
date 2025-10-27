export type BillingCycle = 'monthly' | 'annual' | 'weekly';
export type SubscriptionCategory =
  | 'Streaming'
  | 'Cloud'
  | 'Gaming'
  | 'Mobile'
  | 'Productivité'
  | 'Autre';
export type FamilyPaymentMode = 'rotation' | 'shared';

export interface Member {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface PaymentHistory {
  month: string;
  paidBy: string;
}

export interface Rotation {
  order: string[];
  startDate: string;
  currentIndex: number;
  overrides?: Record<string, string>;
}

export interface Subscription {
  id: string;
  name: string;
  providerId?: string;
  price: number;
  currency: string;
  billing: BillingCycle;
  nextCharge: string;
  category: SubscriptionCategory;
  isPaused: boolean;
  familial: boolean;
  participants?: string[];
  paymentMode?: FamilyPaymentMode;
  shares?: Record<string, number>;
  rotation?: Rotation;
  history?: PaymentHistory[];
  notes?: string;
}

export type ProviderCategory =
  | 'Streaming Vidéo'
  | 'Musique'
  | 'Gaming'
  | 'Cloud'
  | 'Productivité'
  | 'Éducation'
  | 'VPN & Sécurité'
  | 'Sport & Bien-être'
  | 'Téléphonie'
  | 'Presse'
  | 'Livres Audio'
  | 'Services'
  | 'Créateurs'
  | 'Salles de Sport'
  | 'Autre';

export interface Provider {
  id: string;
  name: string;
  icon: string;
  color: string;
  svg?: string;
  category: ProviderCategory;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}
