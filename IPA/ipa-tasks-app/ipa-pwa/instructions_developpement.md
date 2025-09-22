# Instructions de développement - IPA Tasks

## Objectif
Développer une PWA (Progressive Web App) de gestion de tâches évolutives pour IPA en oncologie selon les spécifications du cahier des charges complet.

## Context important
Cette application est destinée à un infirmier en pratique avancée (IPA) travaillant en oncologie médicale dans un CLC. L'utilisateur a besoin d'une solution robuste qui fonctionne même hors ligne (scenario ascenseur) et qui respecte l'anonymisation des données patients.

## Priorités de développement

### Phase 1 : MVP avec catégories et mode hors ligne (4-5 semaines)
1. **Setup initial du projet**
   - React 18 + TypeScript + Vite
   - Tailwind CSS pour le styling
   - Configuration PWA avec Workbox
   - Structure de dossiers selon architecture définie

2. **Configuration Supabase**
   - Setup authentification
   - Création des tables selon le schéma de base de données
   - Configuration Row Level Security (RLS)
   - Setup pour mode offline/online

3. **Système de catégories et actions configurables**
   - 4 catégories par défaut : Patient, Projet, Administratif, Équipe
   - 7 actions par défaut : APPELER, CONTROLER, PROGRAMMER, REGARDER, DISCUTER, RENCONTRER, ORGANISER
   - Interface de configuration dans les paramètres

4. **Parsing intelligent basique**
   - Détection automatique de catégories par mots-clés
   - Extraction des actions, patients, contexte, priorité, échéance
   - Fallback vers formulaire structuré

5. **Interface principale avec validation rapide**
   - TaskList avec boutons [✅] et [↗️] pour chaque tâche
   - Filtres par catégorie, priorité, statut
   - Affichage responsive desktop/mobile

6. **Mode hors ligne complet**
   - IndexedDB pour stockage local
   - Queue de synchronisation
   - Service Worker pour cache et sync background

### Phase 2 : PWA complète et tâches récurrentes (3-4 semaines)
1. **Installation PWA native**
   - Manifest.json optimisé
   - Prompt d'installation contextuel
   - Icônes et thème

2. **Tâches évolutives**
   - Système d'historique d'actions par tâche
   - Interface d'ajout d'actions à une tâche existante
   - Workflow : ECBU → résultats → changement antibio → rappel patient

3. **Tâches récurrentes**
   - Interface de création récurrence (quotidien, hebdomadaire, mensuel)
   - Génération automatique des prochaines occurrences (3 mois à l'avance)
   - Gestion des modifications (instance vs série)

4. **Notifications push**
   - Rappels échéances
   - Notifications tâches urgentes
   - Résumé quotidien

5. **Synchronisation robuste**
   - Gestion des conflits
   - Retry automatique
   - Indicateurs de statut sync

### Phase 3 : Optimisations et finition (1-2 semaines)
1. **Performance et stabilité**
2. **Tests sur différents devices**
3. **Documentation technique**
4. **Déploiement production**

## Stack technique requis

```
Frontend:
- React 18 + TypeScript
- Tailwind CSS + Headless UI
- Vite (build tool)

PWA:
- Workbox pour Service Worker
- Web App Manifest
- IndexedDB pour offline storage

Backend:
- Supabase (PostgreSQL + Auth + Real-time)
- Row Level Security

Parsing:
- Regex patterns personnalisés
- Simple NLP pour catégorisation

Hosting:
- Vercel ou Netlify
```

## Schéma de base de données prioritaire

```sql
-- À créer en Phase 1
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
  date_creation TIMESTAMP DEFAULT NOW(),
  date_completion TIMESTAMP
);

CREATE TABLE actions_tache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tache_id UUID REFERENCES taches(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  contexte TEXT,
  notes TEXT,
  statut VARCHAR(15) DEFAULT 'a_faire' CHECK (statut IN ('a_faire', 'fait')),
  date_creation TIMESTAMP DEFAULT NOW(),
  ordre_sequence INTEGER DEFAULT 1
);
```

## Points critiques à implémenter

### 🚨 Sécurité et anonymisation
- JAMAIS de données patient identifiantes
- Seulement initiales + numéro de dossier anonymisé
- RLS activé sur toutes les tables
- Chiffrement en transit (HTTPS)

### 📱 Mode hors ligne (CRITIQUE)
- L'utilisateur doit pouvoir créer/modifier des tâches dans l'ascenseur
- Synchronisation automatique dès reconnexion
- Aucune perte de données même après 24h offline

### ⚡ Performance utilisateur
- Saisie rapide < 1 seconde
- Parsing en temps réel
- Interface responsive fluide
- Installation PWA en 1 clic

### 🔄 Tâches évolutives
- Une tâche = potentiellement plusieurs actions dans le temps
- Exemple concret : "Contrôler ECBU" → "Regarder résultats" → "Appeler patient"
- Chaque action a son statut et sa date

## Exemples de parsing à implémenter

```javascript
// Exemples de saisies utilisateur et résultats attendus :

"Appeler Mme D. 2022458 résultat ECBU urgent vendredi"
→ Catégorie: Patient, Action: APPELER, Patient: "Mme D. 2022458", 
  Contexte: "résultat ECBU", Priorité: urgent, Échéance: vendredi

"Discuter projet recherche avec Dr Martin lundi"  
→ Catégorie: Équipe, Action: DISCUTER, Contexte: "projet recherche avec Dr Martin",
  Échéance: lundi

"Formation DPC mensuelle"
→ Catégorie: Administratif, Action: ORGANISER, Contexte: "Formation DPC",
  Récurrence: mensuelle (si détectée)
```

## Structure de composants prioritaire

```
src/
├── components/
│   ├── TaskInput.tsx         # Saisie rapide avec parsing en temps réel
│   ├── TaskList.tsx          # Liste avec boutons ✅ et ↗️  
│   ├── TaskItem.tsx          # Item individuel avec catégorie
│   ├── QuickValidation.tsx   # Composant validation rapide
│   ├── FilterBar.tsx         # Filtres par catégorie/priorité/statut
│   ├── TaskHistory.tsx       # Historique actions d'une tâche
│   └── CategoryManager.tsx   # Gestion catégories personnalisées
├── services/
│   ├── taskParser.ts         # Parsing + catégorisation
│   ├── offlineSync.ts        # Synchronisation hors ligne
│   └── supabaseClient.ts     # Configuration DB
└── hooks/
    ├── useOfflineSync.ts     # Hook sync offline
    ├── useCategories.ts      # Hook gestion catégories
    └── useQuickActions.ts    # Hook validation rapide
```

## Validation d'acceptance MVP

### ✅ Fonctionnalités core
- [ ] Création tâche par saisie rapide avec parsing
- [ ] 4 catégories fonctionnelles avec icônes
- [ ] Validation rapide depuis liste (bouton ✅)
- [ ] Filtrage par catégorie/priorité/statut  
- [ ] Mode hors ligne complet avec sync
- [ ] Installation PWA native
- [ ] Interface responsive desktop/mobile

### ✅ Scenarios utilisateur critiques
- [ ] "Dans l'ascenseur" : créer tâche hors ligne → sync auto
- [ ] "ECBU workflow" : tâche évolutive avec actions successives
- [ ] "Validation rapide" : marquer terminé sans ouvrir détail
- [ ] "Catégorisation auto" : parsing détecte catégorie correcte

## Notes importantes pour le développement

1. **Priorité absolue** : Mode hors ligne robuste
2. **UX critique** : Rapidité de saisie et validation  
3. **Données sensibles** : Anonymisation par design
4. **Progressive enhancement** : Web d'abord, PWA ensuite
5. **Parsing intelligent** : Simple mais efficace, fallback manuel

L'objectif est de créer un outil qui s'adapte parfaitement au workflow médical rapide et mobile d'un IPA en oncologie.