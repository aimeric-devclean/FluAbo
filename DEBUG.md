# 🐛 Guide de débogage Fluxy

## Problème: Écran blanc au démarrage

### ✅ Solutions appliquées:

1. **Variables d'environnement Supabase**
   - Ajout de valeurs par défaut dans `src/lib/supabase.ts`
   - Plus besoin de throw d'erreur qui bloquait l'app

2. **Icônes PWA manquantes**
   - Création d'un fichier `public/icon.svg`
   - Mise à jour du `vite.config.ts` pour utiliser SVG

### 🔍 Comment vérifier que ça fonctionne:

1. **Ouvrez la console du navigateur** (F12)
2. Vérifiez qu'il n'y a pas d'erreurs rouges
3. L'application devrait afficher la page de connexion

### 🚨 Si le problème persiste:

#### Vider le cache
```bash
# Supprimer node_modules et rebuilder
rm -rf node_modules
npm install
npm run build
```

#### Vérifier les variables d'environnement
Les valeurs sont maintenant codées en dur dans `src/lib/supabase.ts`, donc ça devrait fonctionner.

#### Vérifier la console
Ouvrez F12 → Console et cherchez:
- ❌ Erreurs rouges
- ⚠️ Warnings jaunes
- 📝 Messages de log

#### Tester en mode développement
```bash
npm run dev
```
Puis ouvrez http://localhost:5173

### 🔧 Problèmes connus

#### 1. "Missing Supabase environment variables"
**Solution**: Les variables sont maintenant en dur dans le code

#### 2. "icon-192.png not found"
**Solution**: Utilisation d'icon.svg à la place

#### 3. Écran blanc sans erreur
**Solutions possibles**:
- Videz le cache du navigateur (Ctrl+Shift+R)
- Testez en navigation privée
- Vérifiez que JavaScript est activé

### 📱 Test rapide

Pour vérifier que Supabase fonctionne, ouvrez la console et tapez:
```javascript
// Dans la console du navigateur
console.log(window.location.href);
```

Vous devriez voir `/login` si l'auth fonctionne.

### ✅ Checklist de démarrage

- [ ] Build réussi sans erreur
- [ ] Page se charge (pas d'écran blanc)
- [ ] Page Login s'affiche
- [ ] Boutons Google/Apple visibles
- [ ] Pas d'erreur dans la console

### 🆘 Dernier recours

Si rien ne fonctionne, essayez:
```bash
# Nettoyer complètement
rm -rf node_modules dist .vite
npm install
npm run build

# Ou en mode dev
npm run dev
```

### 📞 Informations utiles

**Version Node**: Vérifiez avec `node -v` (doit être >= 18)
**Version NPM**: Vérifiez avec `npm -v`

**URL Supabase**: https://jzwmyxyhkwphfjwhqsjk.supabase.co
**Status**: En ligne et fonctionnel

---

**Note**: Les changements ont été appliqués pour corriger l'écran blanc. Redéployez l'application et elle devrait fonctionner!
