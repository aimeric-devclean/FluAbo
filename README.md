# Sub+ - Gestion d'abonnements familiaux

Application PWA moderne pour gérer vos abonnements personnels et familiaux avec système de tour de paiement.

## Fonctionnalités

- **Tableau de bord** : Vue d'ensemble de tous vos abonnements avec coûts mensuels et annuels
- **Gestion famille** : Créez des membres, configurez les tours de paiement, suivez les soldes
- **Analytics** : Visualisez vos dépenses par catégorie et prochaines échéances
- **Calculette** : Convertissez facilement entre mensuel, annuel et hebdomadaire
- **Notes** : Gardez vos rappels importants à portée de main
- **PWA** : Installable, fonctionne hors ligne, 100% local

## Technologies

- React 18 + TypeScript
- Vite
- Tailwind CSS (design glassmorphism premium)
- Zustand (state management avec localStorage)
- React Router (navigation)
- Recharts (graphiques)
- dayjs (gestion des dates)
- Lucide React (icônes)
- Police Inter

## Installation locale

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

## Déploiement sur Netlify

1. Connectez votre repository GitHub à Netlify
2. Configuration de build :
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Déployez !

L'application est 100% statique et ne nécessite aucune configuration serveur.

## Structure du projet

```
src/
├── components/       # Composants réutilisables (GlassCard, Button, Modal, etc.)
├── pages/           # Pages de l'application (Dashboard, Family, Analytics, etc.)
├── store/           # Zustand store avec persistence
├── types/           # Types TypeScript
├── data/            # Données statiques (providers)
├── utils/           # Fonctions utilitaires (calculs)
└── App.tsx          # Composant principal avec routing
```

## Fonctionnement

### Abonnements
- Ajoutez vos abonnements avec prix, périodicité, catégorie
- Marquez-les comme familiaux pour activer le tour de paiement
- Mettez en pause ou gérez selon vos besoins

### Famille et rotation
- Créez des membres avec nom et couleur
- Pour les abonnements familiaux, définissez les participants et leurs parts
- Le système calcule automatiquement qui doit payer ce mois-ci
- Marquez les paiements effectués pour faire tourner
- Consultez les soldes (qui a trop/pas assez payé)

### Données
Toutes les données sont stockées localement dans le navigateur via localStorage. Aucune donnée n'est envoyée sur internet.

## Licence

Projet personnel - Libre d'utilisation
