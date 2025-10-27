# Système de Gestion d'Amis Complet - Guide d'Implémentation

## 🎯 Fonctionnalités Implémentées

### 1. Base de Données ✅
- **subscription_invitations** : Invitations aux abonnements familiaux
- **friend_messages** : Messagerie entre amis
- **subscription_notifications** : Notifications programmées (7 jours, 3 jours, jour J)

### 2. Fonctionnalités à Implémenter

#### A. Profil d'Ami
- Cliquer sur un ami pour voir son profil complet
- Afficher : avatar, pseudo, abonnements partagés, statistiques

#### B. Invitations aux Abonnements Familiaux
- Inviter des amis à rejoindre un abonnement familial
- Accepter/Refuser des invitations
- Synchroniser les données d'abonnement entre amis

#### C. Messagerie
- Envoyer des messages à un ami
- Messages de rappel de paiement
- Notifications de messages non lus

#### D. Notifications Avancées
- **7 jours avant** le prochain paiement
- **3 jours avant** le prochain paiement
- **Le jour J** du paiement
- Synchronisation des notifications pour tous les participants d'un abonnement familial

## 📁 Structure des Fichiers à Créer

```
src/
├── hooks/
│   ├── useInvitations.ts       // Hook pour gérer les invitations
│   ├── useMessages.ts           // Hook pour la messagerie
│   └── useNotifications.ts      // Hook pour les notifications avancées
├── components/
│   ├── FriendProfile.tsx        // Modal de profil d'ami
│   ├── InvitationModal.tsx      // Modal d'invitation à un abonnement
│   ├── MessageModal.tsx         // Modal de messagerie
│   └── NotificationBell.tsx     // Cloche de notifications
└── pages/
    └── Friends.tsx               // Page friends mise à jour
```

## 🔧 Implémentation Recommandée

### Étape 1: Hooks Utilitaires

#### useInvitations.ts
```typescript
// Gérer les invitations aux abonnements
- fetchInvitations()
- sendInvitation(subscriptionId, friendUserId)
- respondToInvitation(invitationId, accept: boolean)
- getInvitationsForSubscription(subscriptionId)
```

#### useMessages.ts
```typescript
// Gérer la messagerie
- fetchMessages(friendUserId)
- sendMessage(friendUserId, message, type)
- markAsRead(messageId)
- getUnreadCount()
```

#### useNotifications.ts
```typescript
// Gérer les notifications programmées
- scheduleNotifications(subscription, userIds)
- checkPendingNotifications()
- sendNotification(notificationId)
```

### Étape 2: Composants UI

#### FriendProfile.tsx
- Afficher avatar et infos
- Liste des abonnements partagés
- Bouton "Envoyer un message"
- Statistiques (nombre d'abonnements, total mensuel partagé)

#### InvitationModal.tsx
- Sélectionner un abonnement familial
- Choisir un ou plusieurs amis
- Envoyer les invitations
- Afficher les invitations en attente

#### MessageModal.tsx
- Liste des messages avec un ami
- Zone de saisie pour envoyer un message
- Boutons rapides (rappel de paiement, message général)
- Indicateur de lecture

### Étape 3: Mise à Jour de Friends.tsx

- Ajouter le bouton "Voir le profil" sur chaque ami
- Afficher le badge de messages non lus
- Intégrer le système d'invitations

## 🔔 Système de Notifications

### Types de Notifications

1. **Week Before (7 jours avant)**
   - Message: "🔔 Votre abonnement [NOM] sera débité dans 7 jours"
   - Tous les participants reçoivent la notification

2. **Three Days Before (3 jours avant)**
   - Message: "⚠️ Rappel : [NOM] sera débité dans 3 jours - C'est au tour de [PAYEUR]"
   - Emphasis sur qui doit payer

3. **Day Of (Jour J)**
   - Message: "💳 Aujourd'hui : Paiement de [NOM] par [PAYEUR]"
   - Notification haute priorité

### Synchronisation des Notifications

Pour un abonnement familial :
1. Calculer les 3 dates de notification
2. Créer les notifications pour TOUS les participants
3. Vérifier périodiquement (via cron job ou fonction récurrente)
4. Envoyer les notifications au bon moment

## 🚀 Ordre d'Implémentation Suggéré

1. ✅ Base de données (FAIT)
2. ✅ Types TypeScript (FAIT)
3. 🔄 Hook useInvitations
4. 🔄 Hook useMessages
5. 🔄 Hook useNotifications
6. 🔄 Composant FriendProfile
7. 🔄 Composant MessageModal
8. 🔄 Composant InvitationModal
9. 🔄 Mise à jour Friends.tsx avec nouveau design
10. 🔄 Intégration complète et tests

## ⚠️ Points d'Attention

### Synchronisation des Abonnements
Quand un ami accepte une invitation :
- L'abonnement doit être synchronisé entre les deux utilisateurs
- Les participants doivent être mis à jour
- Les notifications doivent être créées pour le nouvel utilisateur

### Données Locales vs Supabase
- Les abonnements sont actuellement stockés en local (Zustand)
- Il faudra peut-être créer une table `shared_subscriptions` dans Supabase
- Ou synchroniser via un système d'ID partagés

### Notifications en Temps Réel
- Utiliser Supabase Realtime pour les messages
- Notifications push avec Service Workers (PWA)
- Badge de notification sur l'icône de l'app

## 📊 État Actuel

- ✅ Base de données créée
- ✅ Types TypeScript définis
- ✅ RLS policies en place
- ⏳ Hooks à créer
- ⏳ Composants UI à créer
- ⏳ Intégration complète

## 💡 Prochaines Étapes Immédiates

Pour continuer l'implémentation, je recommande de :

1. Créer les hooks `useInvitations`, `useMessages`, `useNotifications`
2. Mettre à jour l'UI de Friends.tsx avec le nouveau design cohérent
3. Ajouter le modal de profil d'ami
4. Implémenter la messagerie basique
5. Ajouter le système d'invitations
6. Finaliser les notifications programmées

Voulez-vous que je continue avec l'une de ces étapes ?
