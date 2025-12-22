# 📘 Guide : Ajouter votre logo CRA comme favicon

## 🎯 Objectif
Remplacer le logo Vite par défaut par le logo CRA dans l'onglet du navigateur.

## 📁 Fichiers concernés

### 1. Votre logo source
Le fichier logo CRA est déjà présent :
```
cra-frontend/public/cra-saint-louis-LOGO50-copie-scaled.jpg
```

### 2. Fichiers à modifier
- `cra-frontend/index.html` (configuration du favicon)
- `cra-frontend/public/` (où placer les fichiers favicon)

## 🔧 Étapes pour ajouter votre logo CRA

### Option 1 : Utilisation simple (format .ico)

1. **Convertir le logo en .ico** (en ligne sur https://convertio.co/jpg-ico/)
   - Téléchargez `cra-saint-louis-LOGO50-copie-scaled.jpg`
   - Convertissez en format ICO (32x32 recommandé)
   - Téléchargez le fichier `favicon.ico`

2. **Placez le fichier dans public/**
   ```bash
   # Copiez votre favicon.ico dans :
   cra-frontend/public/favicon.ico
   ```

3. **Modifiez index.html**
   ```html
   <!-- Remplacez la ligne 5 dans cra-frontend/index.html -->
   <link rel="icon" type="image/x-icon" href="/favicon.ico" />
   ```

4. **Rebuild**
   ```bash
   cd cra-frontend
   npm run build
   ```

5. **Redémarrez le conteneur**
   ```bash
   docker-compose -f docker-compose.dev.yml restart frontend
   ```

### Option 2 : Utilisation avancée (multi-formats)

Pour une meilleure compatibilité sur tous les appareils :

1. **Créez plusieurs tailles de favicon**
   - 16x16.png
   - 32x32.png
   - 180x180.png (pour Apple devices)
   - favicon.ico

2. **Placez-les dans public/**
   ```
   cra-frontend/public/
   ├── favicon.ico
   ├── favicon-16x16.png
   ├── favicon-32x32.png
   └── apple-touch-icon.png
   ```

3. **Modifiez index.html**
   ```html
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />

     <!-- Favicons -->
     <link rel="icon" type="image/x-icon" href="/favicon.ico" />
     <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
     <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
     <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

     <title>ISRA/CRA - Centre de Recherches Agricoles</title>
   </head>
   ```

4. **Rebuild et redémarrez**
   ```bash
   npm run build
   docker-compose -f docker-compose.dev.yml restart frontend
   ```

## 🌐 Vider le cache du navigateur

Après le changement, **IMPORTANT** :

1. **Vider le cache** :
   - Chrome/Edge : `Ctrl + Shift + Delete`
   - Sélectionnez "Images et fichiers en cache"
   - Effacez

2. **Hard refresh** :
   - `Ctrl + Shift + R` ou `Ctrl + F5`

3. **OU tester en navigation privée** :
   - `Ctrl + Shift + N`

## 🛠️ Outils de conversion d'images

### En ligne (gratuit)
- **Convertio** : https://convertio.co/jpg-ico/
- **Favicon.io** : https://favicon.io/favicon-converter/
- **ICO Convert** : https://icoconvert.com/

### Avec Node.js (automatique)
Si vous voulez automatiser la création de tous les formats :

```bash
# Installez sharp
npm install --save-dev sharp

# Créez un script generate-favicon.cjs
node generate-favicon.cjs
```

Le script utilisera votre logo JPG et créera automatiquement tous les formats nécessaires.

## ✅ Vérification

Après le changement, vérifiez que le logo apparaît :

1. Ouvrez http://localhost:5173 en navigation privée
2. Le logo CRA devrait apparaître dans l'onglet du navigateur
3. Si non visible, videz le cache et réessayez

## 📝 Notes importantes

- Les navigateurs cachent fortement les favicons
- Toujours tester en navigation privée d'abord
- Si le logo ne change pas, ajoutez `?v=2` à la fin des URLs dans index.html
  ```html
  <link rel="icon" href="/favicon.ico?v=2" />
  ```
- Ne pas oublier de rebuild après chaque modification
- Le dossier `public/` est automatiquement monté dans Docker (voir docker-compose.dev.yml ligne 90)

## 🔍 Debug

Si ça ne fonctionne toujours pas :

1. Vérifiez que le fichier existe :
   ```bash
   ls -la cra-frontend/public/favicon.ico
   ```

2. Vérifiez qu'il est accessible :
   ```bash
   curl -I http://localhost:5173/favicon.ico
   ```

3. Vérifiez les logs du conteneur :
   ```bash
   docker logs cra-frontend-dev
   ```

Bon courage ! 🚀
