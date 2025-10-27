# Guide de Déploiement - Corrections Synchronisation

## 🔧 Corrections Appliquées

### 1. **Génération d'UUID au lieu de timestamps**
- ✅ Créé `src/utils/uuid.ts` pour générer des UUID valides
- ✅ Remplacé `Date.now().toString()` par `generateUUID()` dans :
  - `SubscriptionModal.tsx`
  - `store/useStore.ts`

### 2. **Exclusion des subscriptions de la persistance Zustand**
- ✅ Modifié `store/useStore.ts` pour ne plus persister les subscriptions en localStorage
- ✅ Les subscriptions viennent maintenant UNIQUEMENT de Supabase

### 3. **Ajout de logs de debug**
- ✅ Logs dans `AuthContext.tsx` pour tracer l'authentification
- ✅ Logs dans `useSubscriptionsSync.ts` pour tracer le chargement
- ✅ Logs dans `useSubscriptions.ts` pour tracer les mutations

### 4. **Correction des RLS policies**
- ✅ `owner_id` pointe maintenant directement vers `auth.users`
- ✅ Migration appliquée pour fixer les foreign keys

## 📦 Déploiement sur Netlify

### Option 1 : Via Interface Netlify (Recommandé)

1. **Commit et push les changements vers votre repo Git**
   ```bash
   git add .
   git commit -m "fix: UUID generation and Supabase sync"
   git push origin main
   ```

2. **Netlify déploiera automatiquement** si vous avez configuré le déploiement continu

### Option 2 : Déploiement Manuel

1. **Build le projet localement**
   ```bash
   npm run build
   ```

2. **Déployer via Netlify CLI**
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Ou via l'interface Netlify** : Drag & Drop du dossier `dist/`

## 🧪 Test Après Déploiement

### 1. Vider le Cache de l'App sur iPhone

1. Ouvrir Safari → Réglages
2. Safari → Effacer historique et données de sites web
3. Confirmer

### 2. Ouvrir la Console (pour iOS)

**Sur Mac avec Safari :**
1. Connecter l'iPhone au Mac via USB
2. Sur Mac : Safari → Développement → [Votre iPhone] → [Votre App]
3. Ouvrir la console JavaScript

### 3. Se Connecter et Vérifier les Logs

**Logs attendus à la connexion :**
```
[Auth] Initial session: 96ce29bd-6d4c-4a75-9163-b0458c7dfcaa aimeric.66666@gmail.com
[Auth] Loading profile for user: 96ce29bd-6d4c-4a75-9163-b0458c7dfcaa
[Auth] Profile loaded: aimeric.66666@gmail.com Aimeric
[Sync] User detected, loading subscriptions...
[Sync] Loading subscriptions for user: 96ce29bd-6d4c-4a75-9163-b0458c7dfcaa
[Sync] Loaded subscriptions: 1
[Sync] Setting subscriptions in store: [{ id: "e120ad1c-...", name: "Netflix", ... }]
[Sync] Subscriptions set successfully
```

**Si vous voyez ces logs :**
- ✅ L'authentification fonctionne
- ✅ Le chargement Supabase fonctionne
- ✅ Netflix devrait apparaître !

**Si Netflix n'apparaît pas malgré les logs :**
- Problème d'affichage UI (pas de synchronisation)
- Vérifier le composant Dashboard/Home

### 4. Test de Persistance

1. ✅ Se déconnecter
   - Log attendu : `[Sync] No user, clearing subscriptions`
2. ✅ Se reconnecter
   - Les mêmes logs qu'à l'étape 3 doivent apparaître
   - Netflix doit réapparaître

### 5. Test d'Ajout d'Abonnement

1. ✅ Ajouter un nouvel abonnement
   - Log attendu : `[useSubscriptions] Adding subscription: <uuid>`
   - Log attendu : `[useSubscriptions] Subscription added successfully`
   - Log attendu : `[Sync] Realtime event: INSERT`

2. ✅ Vérifier dans la base de données Supabase
   - Aller sur le dashboard Supabase
   - Table `subscriptions`
   - Vérifier que l'abonnement est présent avec un UUID valide

## 🐛 Troubleshooting

### Problème : Aucun log dans la console

**Cause :** Le cache PWA n'est pas vidé
**Solution :**
1. Sur iPhone : Réglages → Safari → Avancé → Données de sites web
2. Trouver votre domaine et supprimer
3. Réouvrir l'app

### Problème : Logs apparaissent mais pas de subscriptions

**Cause possible 1 :** L'`owner_id` dans la base ne correspond pas à votre `user.id`

**Vérification :**
1. Noter l'user ID dans le log `[Auth] Initial session: <ID>`
2. Vérifier dans la base que l'abonnement Netflix a le même `owner_id`

**Cause possible 2 :** RLS bloque la lecture

**Vérification :**
```sql
-- Dans Supabase SQL Editor
SELECT * FROM subscriptions WHERE owner_id = '<votre_user_id>';
```

Si la requête ne retourne rien alors que les données existent, c'est RLS qui bloque.

### Problème : "Already syncing, skipping"

**Cause :** La ref `isSyncing` n'est pas réinitialisée
**Solution :** Recharger la page complètement (pas juste se reconnecter)

## 📊 Vérifications Base de Données

### Vérifier l'abonnement Netflix
```sql
SELECT id, owner_id, name, created_at
FROM subscriptions
WHERE name = 'Netflix';
```

### Vérifier l'utilisateur
```sql
SELECT id, email
FROM auth.users
WHERE email = 'aimeric.66666@gmail.com';
```

### Vérifier que owner_id correspond
```sql
SELECT
  s.id as subscription_id,
  s.name,
  s.owner_id,
  u.email as owner_email
FROM subscriptions s
JOIN auth.users u ON s.owner_id = u.id
WHERE u.email = 'aimeric.66666@gmail.com';
```

## ✅ Checklist Finale

- [ ] Code buildé sans erreurs
- [ ] Déployé sur Netlify
- [ ] Cache Safari vidé sur iPhone
- [ ] Console accessible (via Mac ou logs cloud)
- [ ] Logs d'authentification apparaissent
- [ ] Logs de synchronisation apparaissent
- [ ] Netflix apparaît dans l'interface
- [ ] Déconnexion/reconnexion fonctionne
- [ ] Ajout d'abonnement se synchronise
