# IPA Tasks - Application de gestion de tâches pour IPA en oncologie

PWA (Progressive Web App) de gestion de tâches évolutives pour Infirmier en Pratique Avancée (IPA) travaillant en oncologie médicale.

## 🚀 Fonctionnalités principales

### MVP Phase 1 - ✅ Implémenté
- ✅ **Authentification** via Supabase
- ✅ **4 catégories par défaut** : Patient 👤, Projet 📋, Administratif 🏥, Équipe 👥
- ✅ **7 actions par défaut** : APPELER, CONTROLER, PROGRAMMER, REGARDER, DISCUTER, RENCONTRER, ORGANISER
- ✅ **Parsing intelligent** : Détection automatique de catégories, actions, patients, priorité, échéance
- ✅ **Interface responsive** avec validation rapide (boutons ✅ et ↗️)
- ✅ **Filtres avancés** par catégorie, priorité, statut
- ✅ **Configuration PWA** avec Workbox pour mode hors ligne
- ✅ **Mode hors ligne** avec IndexedDB
- ✅ **Synchronisation** automatique

### Phase 2 - ✅ Tâches Évolutives Complètes
- ✅ **Conteneurs de tâches neutres** : "Patient Mme D. (2022458)"
- ✅ **Actions enrichies** avec priorité, échéance et contexte propres
- ✅ **Workflow évolutif** : Action 1 → Action 2 → Action 3...
- ✅ **Interface de gestion** : Ajouter, modifier, supprimer, réorganiser actions
- ✅ **Synchronisation complète** : Actions sauvegardées online/offline
- ✅ **Parsing intelligent amélioré** : Première action automatique avec tous les paramètres

### Exemples de tâches évolutives

```
Saisie: "Appeler Mme D. 2022458 résultat ECBU urgent vendredi"

→ Tâche: "Patient Mme D. (2022458)"
  └── Action 1: APPELER | résultat ECBU | 🔴 urgent | 📅 vendredi

Évolution: Ajouter une action
  └── Action 2: PROGRAMMER | consultation onco | ⚪ normal | 📅 lundi

Évolution: Ajouter une action
  └── Action 3: CONTROLER | observance | ⚪ normal | 📅 mercredi
```

```
Saisie: "Discuter projet recherche avec Dr Martin lundi"

→ Tâche: "Équipe"
  └── Action 1: DISCUTER | projet recherche avec Dr Martin | ⚪ normal | 📅 lundi

Évolution:
  └── Action 2: REDIGER | compte-rendu réunion | ⚪ normal | 📅 mardi
```

## 🛠 Stack technique

- **Frontend** : React 18 + TypeScript + Vite
- **UI/UX** : Tailwind CSS + Headless UI + Heroicons
- **PWA** : Workbox + Web App Manifest + Service Worker
- **Backend** : Supabase (PostgreSQL + Auth + Real-time)
- **Offline** : IndexedDB + Background Sync
- **Parsing** : Custom NLP + Regex patterns

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

## 🚀 Installation et configuration

### 1. Cloner et installer les dépendances

```bash
git clone <your-repo>
cd ipa-pwa
npm install
```

### 2. Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Copier l'URL et la clé anonyme du projet
3. Créer le fichier `.env.local` :

```bash
cp .env.example .env.local
```

4. Remplir `.env.local` avec vos credentials :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Créer le schéma de base de données

1. Aller dans l'éditeur SQL de Supabase
2. Copier-coller le contenu de `supabase-schema.sql`
3. Exécuter le script

Ce script créera :
- Les tables `categories`, `actions_custom`, `taches`, `actions_tache`, `taches_recurrentes`, `sync_queue`
- Les politiques RLS (Row Level Security)
- Les index de performance
- Le trigger pour créer les données par défaut

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera accessible à : http://localhost:5173

### 5. Build de production

```bash
npm run build
npm run preview
```

## 📱 Installation PWA

L'application peut être installée comme une app native :

- **Desktop** : Clic sur l'icône d'installation dans la barre d'adresse
- **Mobile** : "Ajouter à l'écran d'accueil" depuis le menu du navigateur

## 🔐 Sécurité et conformité

- **Anonymisation par design** : Aucune donnée patient identifiante
- **Chiffrement** : HTTPS/TLS + chiffrement Supabase au repos
- **RLS** : Row Level Security activé sur toutes les tables
- **Authentification** : Gestion sécurisée via Supabase Auth

## 📊 Architecture du projet

```
src/
├── components/
│   ├── features/           # Composants métier
│   │   ├── TaskInput.tsx   # Saisie rapide + parsing
│   │   ├── TaskList.tsx    # Liste avec filtres
│   │   ├── TaskItem.tsx    # Item avec boutons ✅/↗️
│   │   ├── FilterBar.tsx   # Filtres avancés
│   │   └── AuthForm.tsx    # Authentification
│   └── ui/                 # Composants UI génériques
├── hooks/                  # Hooks React personnalisés
│   ├── useAuth.ts         # Gestion authentification
│   ├── useCategories.ts   # Gestion catégories
│   ├── useActions.ts      # Gestion actions
│   └── useTasks.ts        # Gestion tâches
├── services/
│   ├── supabaseClient.ts  # Configuration Supabase
│   └── taskParser.ts      # Parsing intelligent
├── types/                 # Types TypeScript
└── utils/                 # Utilitaires
```

## 🧪 Tests et validation

### Scénarios critiques testés

1. **"Dans l'ascenseur"** : Créer tâche hors ligne → sync auto ✅
2. **"Parsing intelligent"** : Détection catégorie/action correcte ✅
3. **"Validation rapide"** : Marquer terminé sans ouvrir ✅
4. **"Responsivité"** : Interface fluide desktop/mobile ✅

### Commandes de test

```bash
npm run build        # Test build production
npm run dev          # Test développement
npm run preview      # Test build local
```

## 🗺 Roadmap

### Phase 3 - Fonctionnalités avancées (à venir)
- [ ] **Notifications push** pour rappels d'échéances
- [ ] **Interface de configuration** des catégories/actions personnalisées
- [ ] **Statistiques et analytics** de productivité
- [ ] **Templates de tâches** pour workflows récurrents
- [ ] **Collaboration** entre IPA d'une même équipe

### Phase 4 - Optimisations
- [ ] **Tâches récurrentes** avec génération automatique
- [ ] **Performance monitoring**
- [ ] **Tests automatisés**
- [ ] **Documentation technique complète**

## 🆘 Support et dépannage

### Erreurs courantes

1. **"Missing Supabase environment variables"**
   - Vérifier `.env.local` avec les bonnes credentials

2. **"Not authenticated"**
   - Créer un compte utilisateur via l'interface de connexion

3. **"Failed to fetch categories/actions"**
   - Vérifier que le schéma SQL a été exécuté correctement
   - Vérifier les politiques RLS dans Supabase

### Logs et debugging

```bash
# Vérifier les logs du serveur de développement
npm run dev

# Vérifier la console navigateur pour les erreurs client
# F12 → Console
```

## 📄 Licence

Application développée pour usage en milieu médical selon les spécifications du cahier des charges IPA Oncologie.

---

**🏥 IPA Tasks - Optimisez votre workflow médical**
