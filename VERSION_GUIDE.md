# Système de gestion de version automatique

## Comment ça marche ?

Le système de versioning automatique incrémente automatiquement le numéro de version à chaque déploiement en production.

### Format de version

Le format de version suit le schéma : `MAJOR.MINOR.PATCH`

- **PATCH** : Incrémenté de 0 à 99
- **MINOR** : Incrémenté de 0 à 99 (quand PATCH atteint 100)
- **MAJOR** : Incrémenté quand MINOR atteint 100

### Exemples de progression

```
1.0.0 → 1.0.1 → 1.0.2 → ... → 1.0.98 → 1.0.99 → 1.1.0 → 1.1.1 → ...
```

```
1.0.99 → 1.1.0
1.1.99 → 1.2.0
1.99.99 → 2.0.0
```

## Commandes disponibles

### Déployer en production (avec auto-increment)
```bash
npm run deploy
```
Cette commande :
1. Incrémente automatiquement la version
2. Génère le fichier `src/version.ts`
3. Build l'application
4. Déploie sur Netlify

### Incrémenter manuellement la version
```bash
npm run version:bump
```

### Build sans incrémenter la version
```bash
npm run build
```

## Affichage de la version

La version est affichée en bas de la page **Paramètres** de l'application.

Le numéro de version est automatiquement récupéré depuis le fichier `src/version.ts` qui est généré à chaque build.

## Fichiers impliqués

- `version-bump.js` : Script qui incrémente la version dans `package.json`
- `generate-version.js` : Script qui génère `src/version.ts` depuis `package.json`
- `src/version.ts` : Fichier généré contenant la version courante (ne pas éditer manuellement)
- `package.json` : Source de vérité pour le numéro de version

## Notes importantes

- Le fichier `src/version.ts` est généré automatiquement, ne pas le modifier manuellement
- La version est stockée dans `package.json` qui doit être commité dans git
- Chaque déploiement incrémente automatiquement la version
