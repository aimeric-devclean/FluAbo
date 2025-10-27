# 🔐 Configuration de l'authentification Fluxy

## Vue d'ensemble

Fluxy intègre maintenant un système d'authentification complet avec Supabase permettant:
- ✅ Connexion via Google OAuth
- ✅ Connexion via Apple OAuth
- ✅ Gestion des profils utilisateurs
- ✅ Système d'amis (réseau social)
- ✅ Partage d'abonnements entre utilisateurs
- ✅ Synchronisation cloud automatique

## 📊 Architecture de la base de données

### Tables créées

#### `profiles`
- Profils utilisateurs liés à auth.users
- Champs: id, email, display_name, avatar_url

#### `subscriptions`
- Abonnements avec support de partage
- Champs: owner_id, name, price, billing, is_shared, payment_mode, etc.

#### `subscription_participants`
- Liens entre utilisateurs et abonnements partagés
- Supporte la rotation de paiement

#### `friendships`
- Connexions sociales entre utilisateurs
- Statuts: pending/accepted/blocked

#### `subscription_history`
- Historique des paiements
- Tracking de qui a payé quoi et quand

## 🔧 Configuration requise

### 1. Configurer les providers OAuth dans Supabase

#### Google OAuth
1. Allez dans votre [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez-en un
3. Activez l'API Google+
4. Créez des identifiants OAuth 2.0:
   - Type: Application Web
   - Origines JavaScript autorisées: `https://votre-projet.supabase.co`
   - URIs de redirection: `https://votre-projet.supabase.co/auth/v1/callback`
5. Dans Supabase Dashboard → Authentication → Providers → Google:
   - Activez Google
   - Ajoutez votre Client ID et Client Secret

#### Apple OAuth
1. Allez sur [Apple Developer](https://developer.apple.com/)
2. Certificates, Identifiers & Profiles → Identifiers
3. Créez un Service ID:
   - Type: Services IDs
   - Configurez Sign in with Apple
   - Domaines et sous-domaines: `votre-projet.supabase.co`
   - Return URLs: `https://votre-projet.supabase.co/auth/v1/callback`
4. Créez une clé privée (.p8)
5. Dans Supabase Dashboard → Authentication → Providers → Apple:
   - Activez Apple
   - Ajoutez Services ID, Team ID, Key ID et Private Key

### 2. Configuration du redirect URL

Dans Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://votre-domaine.com`
- Redirect URLs:
  - `http://localhost:5173` (développement)
  - `https://votre-domaine.com` (production)

## 🚀 Utilisation

### Authentification

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, profile, signInWithGoogle, signInWithApple, signOut } = useAuth();

  return (
    <div>
      {!user ? (
        <>
          <button onClick={signInWithGoogle}>Google</button>
          <button onClick={signInWithApple}>Apple</button>
        </>
      ) : (
        <>
          <p>Bonjour {profile?.display_name}</p>
          <button onClick={signOut}>Déconnexion</button>
        </>
      )}
    </div>
  );
}
```

### Gestion des amis

```typescript
import { useFriends } from './hooks/useFriends';

function FriendsComponent() {
  const { friends, sendFriendRequest, acceptFriendRequest } = useFriends();

  const addFriend = async () => {
    await sendFriendRequest('ami@example.com');
  };

  return (
    <div>
      {friends.map(friend => (
        <div key={friend.id}>
          {friend.display_name} - {friend.status}
        </div>
      ))}
    </div>
  );
}
```

### Abonnements partagés (À venir)

La prochaine étape sera d'intégrer le partage d'abonnements:

```typescript
// Créer un abonnement partagé
await createSharedSubscription({
  name: 'Netflix',
  price: 15.99,
  participants: [friendId1, friendId2],
  payment_mode: 'rotation'
});

// Ajouter un ami à un abonnement existant
await addParticipantToSubscription(subscriptionId, friendId);
```

## 🔒 Sécurité

### Row Level Security (RLS)
Toutes les tables ont RLS activé avec des politiques strictes:
- Les utilisateurs ne voient que leurs données
- Les abonnements partagés sont visibles uniquement par les participants
- Les profils d'amis sont visibles uniquement si la relation est acceptée

### Bonnes pratiques
- ✅ Toutes les requêtes passent par RLS
- ✅ Les tokens sont gérés automatiquement par Supabase
- ✅ Les sessions sont sécurisées
- ✅ OAuth flows standard (pas de mots de passe stockés)

## 📱 Pages ajoutées

### `/login`
- Page de connexion avec boutons Google/Apple
- Design moderne et responsive
- Redirection automatique si déjà connecté

### `/friends`
- Liste des amis acceptés
- Demandes reçues à traiter
- Demandes envoyées en attente
- Ajout d'amis par email

### Settings
- Nouveau bouton "Gérer mes amis"
- Bouton de déconnexion
- Profil utilisateur affiché

## 🔄 Migration des données locales

Pour les utilisateurs existants, voici comment migrer leurs données locales vers Supabase:

```typescript
// À implémenter: fonction de migration
async function migrateLocalDataToCloud() {
  const localSubscriptions = useStore.getState().subscriptions;
  const userId = supabase.auth.getUser().data.user?.id;

  for (const sub of localSubscriptions) {
    await supabase.from('subscriptions').insert({
      owner_id: userId,
      name: sub.name,
      price: sub.price,
      // ... autres champs
    });
  }
}
```

## 🎯 Prochaines étapes

1. ✅ Authentification Google/Apple
2. ✅ Système d'amis
3. ✅ Base de données partagée
4. ⏳ Migration du store Zustand vers Supabase
5. ⏳ UI pour partager des abonnements
6. ⏳ Notifications push pour les rotations
7. ⏳ Mode offline avec sync

## 🐛 Debug

### Vérifier l'authentification
```typescript
const session = await supabase.auth.getSession();
console.log('Session:', session);
```

### Vérifier RLS
```typescript
const { data, error } = await supabase.from('profiles').select('*');
console.log('Data:', data);
console.log('Error:', error); // Devrait être null si RLS OK
```

### Logs Supabase
Consultez les logs dans Supabase Dashboard → Logs → Postgres Logs

## 📞 Support

Pour toute question sur l'authentification ou le partage:
1. Vérifiez les logs Supabase
2. Testez les politiques RLS
3. Validez les configurations OAuth

---

**Fluxy v2.0** - Maintenant avec partage familial ! 🚀
