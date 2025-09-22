# Cahier des charges - Application de gestion de tâches IPA Oncologie

## 1. Contexte et objectifs

### 1.1 Contexte professionnel
- **Utilisateur cible** : Infirmier en pratique avancée (IPA) en oncologie médicale
- **Environnement** : Centre de lutte contre le cancer (CLC)
- **Activités** : Hôpital de jour (traitements/entretiens) et consultations de suivi des toxicités (cancer du sein à fort taux de récidive)

### 1.2 Objectif principal
Développer une application web progressive (PWA) installable comme application native, permettant la gestion efficace et sécurisée des tâches cliniques évolutives avec synchronisation hors ligne.

### 1.3 Problématique adressée
Optimisation de l'organisation professionnelle par la centralisation des tâches cliniques évolutives, permettant le suivi longitudinal des actions liées aux patients et projets, avec fonctionnement hors ligne.

## 2. Spécifications fonctionnelles

### 2.1 Gestion des tâches évolutives et catégorisées

#### 2.1.1 Création et évolution de tâches
**Modes de saisie :**
- **Saisie rapide** : Ligne de texte unique avec parsing automatique
- **Formulaire détaillé** : Interface structurée en cas d'échec du parsing
- **Ajout d'actions** : Extension d'une tâche existante avec nouvelles actions
- **Tâches récurrentes** : Configuration de templates avec fréquence automatique

**Catégories de tâches :**
- 👤 **Patient** : Soins, examens, suivi médical
- 📋 **Projet** : Projets transversaux, recherche, amélioration qualité
- 🏥 **Administratif** : Formations, réunions, reportings, DPC
- 👥 **Équipe** : Coordination avec médecins/collègues

**Parsing intelligent :**
```javascript
// Extraction automatique des éléments :
- Catégorie : classification automatique (Patient, Projet, Administratif, Équipe)
- Patient : initiales + numéro anonymisé (ex: "Mme D. 2022458") [si applicable]
- Action : verbes d'action (APPELER, CONTROLER, REGARDER, PROGRAMMER, DISCUTER, RENCONTRER, ORGANISER)
- Contexte : objet médical, projet, ou sujet de discussion
- Priorité : mots-clés (urgent, important, normal)
- Échéance : temporalité (vendredi, demain, dans X jours, date)
```

**Différenciation Action vs Contexte :**
- **ACTION** : Que dois-je faire ? (verbes d'action configurables)
- **CONTEXTE** : Pourquoi/Pour quoi/Avec qui ? (objet médical, projet, personne)

#### 2.1.2 Structure des données évolutive
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  nom VARCHAR(50) NOT NULL,
  icone VARCHAR(10) DEFAULT '📋',
  couleur VARCHAR(20) DEFAULT '#6B7280',
  ordre INTEGER DEFAULT 1,
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE actions_custom (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  nom VARCHAR(50) NOT NULL,
  ordre INTEGER DEFAULT 1,
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE taches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  titre VARCHAR(255) NOT NULL,
  categorie_id UUID REFERENCES categories(id),
  patient_initiales VARCHAR(10),
  patient_numero_anonymise VARCHAR(20),
  priorite VARCHAR(10) DEFAULT 'normal' CHECK (priorite IN ('urgent', 'normal')),
  statut VARCHAR(15) DEFAULT 'a_faire' CHECK (statut IN ('a_faire', 'en_cours', 'termine')),
  echeance_actuelle DATE,
  is_recurrente BOOLEAN DEFAULT FALSE,
  tache_recurrente_id UUID REFERENCES taches_recurrentes(id),
  date_creation TIMESTAMP DEFAULT NOW(),
  date_completion TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE actions_tache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tache_id UUID REFERENCES taches(id) ON DELETE CASCADE,
  texte_original TEXT,
  action VARCHAR(50) NOT NULL,
  contexte TEXT,
  notes TEXT,
  echeance DATE,
  statut VARCHAR(15) DEFAULT 'a_faire' CHECK (statut IN ('a_faire', 'fait')),
  date_creation TIMESTAMP DEFAULT NOW(),
  date_completion TIMESTAMP,
  ordre_sequence INTEGER DEFAULT 1
);

CREATE TABLE taches_recurrentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  template_titre VARCHAR(255) NOT NULL,
  categorie_id UUID REFERENCES categories(id),
  template_contexte TEXT,
  priorite VARCHAR(10) DEFAULT 'normal',
  frequence VARCHAR(20) CHECK (frequence IN ('daily', 'weekly', 'monthly')),
  jour_semaine INTEGER CHECK (jour_semaine BETWEEN 0 AND 6), -- 0=dimanche
  jour_mois INTEGER CHECK (jour_mois BETWEEN 1 AND 31),
  date_debut DATE NOT NULL,
  date_fin DATE,
  nb_occurrences INTEGER,
  prochaine_generation DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(50),
  record_id UUID,
  operation VARCHAR(20) CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);
```

### 2.2 Interface utilisateur

#### 2.2.1 Vue principale
**Système de filtrage avancé :**
- Boutons rapides : [À faire] [En cours] [Terminé]
- Sélecteur priorité : [Urgent] [Normal] [Tous]
- Filtres catégories : [👤 Patient] [📋 Projet] [🏥 Admin] [👥 Équipe] [Tous]
- Tri par : [Date d'échéance] [Date de création] [Priorité] [Catégorie]

**Affichage liste avec validation rapide :**
```
[🔴] 👤 Contrôler ECBU Mme D. (2 actions)        [✅] [↗️]  Ven 22/09
     └ Résultats vus → Appeler patient
[⚪] 📋 Discuter projet X avec Dr Y               [✅] [↗️]  Lun 25/09
[🟡] 🏥 Formation DPC (récurrent)                [✅] [↗️]  30/09/2025
```
- **[✅]** : Validation directe sans ouvrir la tâche
- **[↗️]** : Ouvrir pour détails/évolution

#### 2.2.2 Interface de configuration personnalisable
**Gestion des catégories :**
```
⚙️ Paramètres > Catégories de tâches
┌─────────────────────────────────────────┐
│ 👤 Patient            [✏️] [🗑️]       │
│ 📋 Projet             [✏️] [🗑️]       │  
│ 🏥 Administratif      [✏️] [🗑️]       │
│ 👥 Équipe             [✏️] [🗑️]       │
│ ➕ [Ajouter catégorie]                 │
└─────────────────────────────────────────┘
```

**Gestion des actions :**
```
⚙️ Paramètres > Actions disponibles
┌─────────────────────────────────────────┐
│ APPELER               [✏️] [🗑️]       │
│ CONTROLER             [✏️] [🗑️]       │
│ PROGRAMMER            [✏️] [🗑️]       │
│ REGARDER              [✏️] [🗑️]       │
│ DISCUTER              [✏️] [🗑️]       │
│ RENCONTRER            [✏️] [🗑️]       │
│ ORGANISER             [✏️] [🗑️]       │
│ ➕ [Ajouter action]                    │
└─────────────────────────────────────────┘
```

#### 2.2.3 Interface de tâches récurrentes
**Création de récurrence :**
```
┌─── Créer tâche récurrente ────────────────┐
│ Titre : [Formation DPC mensuelle]        │
│ Catégorie : [🏥 Administratif ▼]         │
│ Action : [ORGANISER ▼]                   │
│                                          │
│ 🔄 Récurrence :                          │
│ ○ Quotidienne                            │
│ ● Hebdomadaire → [Lundi ▼]               │
│ ○ Mensuelle → [1er du mois ▼]            │
│                                          │
│ 📅 Début : [01/10/2025]                  │
│ 🔚 Fin : ○ Jamais ● Après [12] fois      │
│                                          │
│ [💾 Créer] [❌ Annuler]                  │
└──────────────────────────────────────────┘
```

#### 2.2.4 Interface d'évolution de tâche
**Vue détaillée avec historique :**
```
┌─── 👤 Contrôler ECBU Mme D. (2022458) ─────┐
│ 📋 Historique des actions :                │
│ ✅ 22/09 10:30 - REGARDER résultats ECBU  │
│    📝 Germe E.coli résistant, changement   │
│ 📞 25/09 À faire - APPELER patiente        │
│    📝 Suivi post-changement antibio        │
│                                            │
│ ➕ Ajouter une action :                    │
│ [Nouvelle action...]                       │
│ 📅 Échéance : [25/09/2025] 🔴 [Urgent]    │
└────────────────────────────────────────────┘
```

#### 2.2.5 Actions rapides
- ✅ Marquer tâche terminée (depuis liste ou détail)
- ➕ Ajouter nouvelle action à la tâche existante
- ✏️ Édition en ligne (double-clic)
- 📋 Voir historique complet
- 🔄 Créer tâche similaire (template)
- 🗑️ Suppression avec confirmation

### 2.3 Fonctionnement hors ligne

#### 2.3.1 Synchronisation différée
**Mécanisme technique :**
```javascript
// Service Worker pour gestion offline
- Stockage local : IndexedDB pour persistance
- Queue de synchronisation : actions en attente
- Auto-sync : dès reconnexion réseau
- Résolution conflits : timestamp-based
```

**Expérience utilisateur :**
- Fonctionnement transparent en mode hors ligne
- Synchronisation automatique à la reconnexion
- Interface identique online/offline

#### 2.3.2 Installation native PWA
**Capacités d'installation :**
- **Mobile** : "Ajouter à l'écran d'accueil" 
- **Desktop** : Installation via navigateur
- **Comportement** : Lancement comme app native
- **Intégration OS** : Icône dans menu/dock

### 2.4 Notifications et rappels

#### 2.4.1 Notifications push (PWA)
- **Échéances du jour** : Notification à 8h00
- **Tâches urgentes** : Rappel toutes les 2h
- **Échéances dépassées** : Alerte quotidienne

#### 2.4.2 Indicateurs visuels
- Badge de compteur sur l'icône d'application
- Pop-up discret en cas de tâche critique
- Barre de statut avec résumé quotidien

## 3. Spécifications techniques

### 3.1 Architecture

#### 3.1.1 Stack technologique
```
Frontend  : React 18 + TypeScript
UI/UX     : Tailwind CSS + Headless UI
PWA       : Workbox + Web App Manifest + Service Worker
Backend   : Supabase (PostgreSQL + Auth + Real-time)
Offline   : IndexedDB + Background Sync
Parsing   : Custom NLP + Regex patterns
Hosting   : Vercel/Netlify
```

#### 3.1.2 Architecture des composants
```
src/
├── components/
│   ├── TaskInput.tsx         # Saisie rapide + parsing
│   ├── TaskList.tsx          # Affichage filtrable avec validation rapide
│   ├── TaskItem.tsx          # Item individuel avec boutons ✅ et ↗️
│   ├── TaskHistory.tsx       # Historique actions évolutives
│   ├── ActionForm.tsx        # Ajout actions à tâche existante
│   ├── FilterBar.tsx         # Système de filtres + catégories
│   ├── CategoryManager.tsx   # Gestion catégories personnalisées
│   ├── ActionManager.tsx     # Gestion actions personnalisées
│   ├── RecurringTasks.tsx    # Interface tâches récurrentes
│   └── QuickValidation.tsx   # Composant validation directe
├── services/
│   ├── taskParser.ts         # Parsing NLP avec catégorisation
│   ├── supabaseClient.ts     # Configuration DB
│   ├── offlineSync.ts        # Synchronisation hors ligne
│   ├── recurringService.ts   # Gestion automatique récurrences
│   └── notifications.ts     # Gestion PWA push
├── utils/
│   ├── patterns.ts           # Regex patterns catégorisés
│   ├── dateHelpers.ts        # Gestion dates/échéances
│   ├── offlineStorage.ts     # IndexedDB wrapper
│   └── categoryHelpers.ts    # Utilitaires catégories/actions
└── hooks/
    ├── useOfflineSync.ts     # Hook synchronisation
    ├── useTaskHistory.ts     # Hook historique tâches
    ├── useCategories.ts      # Hook gestion catégories
    ├── useRecurring.ts       # Hook tâches récurrentes
    └── useQuickActions.ts    # Hook actions rapides
```

### 3.2 Sécurité et confidentialité

#### 3.2.1 Anonymisation par design
- **Aucune donnée patient identifiante** stockée
- **Initiales + numéro de dossier** uniquement
- **Chiffrement en transit** (HTTPS/TLS 1.3)
- **Données à repos chiffrées** (Supabase encryption)

#### 3.2.2 Authentification Supabase
```javascript
// Configuration sécurisée
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)
```

#### 3.2.3 Politiques de sécurité (RLS)
```sql
-- Row Level Security
ALTER TABLE taches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur ne voit que ses tâches" ON taches
  FOR ALL USING (auth.uid() = user_id);
```

### 3.3 Progressive Web App (PWA) installable

#### 3.3.1 Manifest.json
```json
{
  "name": "IPA Tasks - Gestion Oncologie",
  "short_name": "IPA Tasks",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["medical", "productivity", "utilities"],
  "description": "Application de gestion de tâches pour IPA en oncologie"
}
```

#### 3.3.2 Service Worker avancé
```javascript
// Cache stratégique + synchronisation hors ligne
const CACHE_STRATEGIES = {
  app_shell: 'cache-first',        // Interface statique
  api_data: 'network-first',       // Données dynamiques
  offline_queue: 'queue-sync'      // Actions différées
};

// Gestion synchronisation background
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

// Installation automatique
self.addEventListener('beforeinstallprompt', (e) => {
  // Proposition d'installation contextuelle
  e.preventDefault();
  showInstallPrompt(e);
});
```

#### 3.3.3 Synchronisation hors ligne
```javascript
// Architecture de synchronisation
class OfflineSync {
  constructor() {
    this.queue = new IndexedDBQueue('sync_queue');
    this.isOnline = navigator.onLine;
  }

  async addToQueue(operation, data) {
    // Ajouter action à la queue locale
    await this.queue.add({
      operation,
      data,
      timestamp: Date.now(),
      retry_count: 0
    });
  }

  async sync() {
    // Synchroniser queue avec Supabase
    const pending = await this.queue.getAll();
    for (const item of pending) {
      try {
        await this.syncItem(item);
        await this.queue.remove(item.id);
      } catch (error) {
        await this.handleSyncError(item, error);
      }
    }
  }
}
```

## 4. Phases de développement

### 4.1 Phase 1 - MVP avec catégories et fonctionnement hors ligne (4-5 semaines)
- ✅ Authentification Supabase
- ✅ Catégories et actions par défaut (4 catégories + 7 actions)
- ✅ CRUD tâches avec historique d'actions et catégorisation
- ✅ Parsing intelligent avec détection automatique de catégories
- ✅ Interface responsive avec validation rapide (boutons ✅ et ↗️)
- ✅ Filtres par catégorie, priorité, statut
- ✅ Stockage offline (IndexedDB)
- ✅ Synchronisation basique

### 4.2 Phase 2 - PWA complète et personnalisation (3-4 semaines)
- ✅ Installation PWA native
- ✅ Service Worker avancé
- ✅ Synchronisation background robuste
- ✅ Interface de configuration (catégories/actions personnalisées)
- ✅ Tâches récurrentes avec génération automatique
- ✅ Parsing NLP amélioré pour nouvelles catégories/actions
- ✅ Notifications push
- ✅ Interface d'évolution de tâches complète
- ✅ Gestion conflits de synchronisation

### 4.3 Phase 3 - Optimisations et finition (1-2 semaines)
- ✅ Performance monitoring
- ✅ Gestion d'erreurs robuste
- ✅ Interface de gestion des récurrences
- ✅ Nettoyage automatique anciennes tâches terminées
- ✅ Feedback utilisateur
- ✅ Documentation technique
- ✅ Tests sur différents appareils
- ✅ Déploiement production

## 5. Critères d'acceptation

### 5.1 Performance
- **Temps de chargement** : < 2 secondes (première visite)
- **Temps de chargement** : < 1 seconde (visite répétée, cache)
- **Saisie de tâche** : < 1 seconde de parsing
- **Synchronisation** : < 3 secondes après reconnexion
- **Fonctionnement hors ligne** : 100% des fonctionnalités core

### 5.2 Usabilité
- **Installation PWA** : 1 clic sur mobile/desktop
- **Courbe d'apprentissage** : < 5 minutes
- **Évolution de tâche** : < 3 clics pour ajouter action
- **Accessibilité** : WCAG 2.1 AA
- **Multi-navigateurs** : Chrome, Firefox, Safari, Edge

### 5.3 Fiabilité
- **Disponibilité online** : 99.9% (SLA Supabase)
- **Fonctionnement offline** : 100% fiable
- **Perte de données** : 0% (queue de synchronisation)
- **Récupération après panne** : automatique
- **Synchronisation après 24h offline** : 100% des données

## 6. Budget et timeline

### 6.1 Coûts estimés
- **Développement** : 40-60h (freelance/interne)
- **Supabase** : ~5€/mois (Pro plan)
- **Hosting** : Gratuit (Vercel/Netlify)
- **Maintenance** : 2-4h/mois

### 6.2 Planning prévisionnel
- **Semaine 1-2** : Setup + authentification
- **Semaine 3-4** : Interface + parsing
- **Semaine 5-6** : PWA + notifications
- **Semaine 7** : Tests + déploiement

*Ce cahier des charges constitue le référentiel technique et fonctionnel pour le développement de l'application IPA Tasks.*