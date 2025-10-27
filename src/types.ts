export type BillingCycle = 'weekly' | 'monthly' | 'annual';
export type FamilyPaymentMode = 'rotation' | 'shared';

export type ProviderCategory =
  | 'Streaming Vidéo'
  | 'Musique'
  | 'Gaming'
  | 'Cloud'
  | 'Productivité'
  | 'Créateurs'
  | 'Éducation'
  | 'VPN & Sécurité'
  | 'Sport & Bien-être'
  | 'Salles de Sport'
  | 'Téléphonie'
  | 'Presse'
  | 'Livres Audio'
  | 'Services'
  | 'Autre';

export type SubscriptionCategory = ProviderCategory;

export interface Provider {
  id: string;
  name: string;
  icon: string;
  color: string;
  svg?: string;
  category: ProviderCategory;
}

export interface PaymentHistory {
  month: string;
  paidBy: string;
}

export interface Rotation {
  order: string[];
  currentIndex: number;
  overrides?: Record<string, string>;
  startDate: string;
}

export interface Subscription {
  id: string;
  name: string;
  providerId?: string;
  customIcon?: string;
  customColor?: string;
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

export type AvatarType = 'emoji' | 'photo' | 'initial';

export interface Member {
  id: string;
  name: string;
  color: string;
  avatarType?: AvatarType;
  emoji?: string;
  photoUrl?: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected';
export type MessageType = 'payment_reminder' | 'general' | 'invitation';
export type NotificationType = 'week_before' | 'three_days_before' | 'day_of';

export interface SubscriptionInvitation {
  id: string;
  subscription_id: string;
  inviter_id: string;
  invited_user_id: string;
  status: InvitationStatus;
  created_at: string;
  responded_at?: string;
  inviter_profile?: {
    username: string;
    display_name: string;
    avatar_preset: string;
  };
  subscription_name?: string;
}

export interface FriendMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  subscription_id?: string;
  message: string;
  message_type: MessageType;
  read: boolean;
  created_at: string;
  sender_profile?: {
    username: string;
    display_name: string;
    avatar_preset: string;
  };
}

export interface SubscriptionNotification {
  id: string;
  user_id: string;
  subscription_id: string;
  notification_type: NotificationType;
  notification_date: string;
  sent: boolean;
  created_at: string;
}
