# 🗄️ Scripts de Base de Données IPA

Ce dossier contient les scripts SQL pour gérer la base de données de l'application IPA Tasks.

## 📋 Fichiers inclus

### 1. `reset_database.sql`
**Script de réinitialisation complète**
- Supprime toutes les tables existantes
- Recrée la structure avec la nouvelle architecture optimisée
- Inclut le support du soft delete et de la synchronisation offline-first
- Configure les index, triggers et politiques RLS

### 2. `setup_user_defaults.sql`
**Script d'initialisation des données par défaut**
- Insère les catégories et actions par défaut pour un utilisateur
- À exécuter après la création d'un nouvel utilisateur

### 3. `maintenance.sql`
**Script de maintenance régulière**
- Nettoyage des données soft-deleted anciennes
- Statistiques et monitoring
- Détection d'anomalies
- Optimisation des performances

## 🚀 Comment utiliser

### Étape 1: Réinitialisation complète
```sql
-- Dans l'éditeur SQL de Supabase, exécutez:
\i reset_database.sql
```

### Étape 2: Configuration d'un utilisateur
1. Connectez-vous à votre application pour créer un utilisateur
2. Récupérez l'UUID de l'utilisateur :
   ```sql
   SELECT auth.uid();
   ```
3. Modifiez `setup_user_defaults.sql` en remplaçant `YOUR_USER_ID_HERE` par l'UUID réel
4. Exécutez le script :
   ```sql
   \i setup_user_defaults.sql
   ```

### Étape 3: Maintenance (optionnelle)
```sql
-- À exécuter périodiquement (par exemple, chaque semaine)
\i maintenance.sql
```

## 🏗️ Architecture de la base

### Tables principales

#### `categories`
- Catégories de tâches (Consultation, Administration, etc.)
- Support du soft delete avec `deleted_at`
- Triggers automatiques pour `updated_at`

#### `taches`
- Conteneurs neutres pour les tâches
- Champs: titre, patient, priorité, statut, échéance
- Lien vers catégorie (optionnel)

#### `actions_tache`
- Actions évolutives liées aux tâches
- Chaque action a sa propre priorité, échéance, statut
- Ordre de séquence pour l'enchaînement

#### `actions_custom`
- Actions personnalisées réutilisables
- Définies par l'utilisateur

#### `recurring_tasks`
- Modèles pour les tâches récurrentes
- Fréquences: daily, weekly, monthly

### Fonctionnalités clés

✅ **Soft Delete**: Toutes les suppressions sont logiques avec `deleted_at`
✅ **Timestamps automatiques**: `updated_at` mis à jour automatiquement
✅ **RLS sécurisé**: Isolation complète des données par utilisateur
✅ **Index optimisés**: Performances pour les requêtes de synchronisation
✅ **Fonctions utilitaires**: Nettoyage et initialisation automatiques

## ⚠️ Points importants

### Avant la réinitialisation
- **Sauvegardez vos données importantes** (le script supprime tout)
- Assurez-vous que personne n'utilise l'application pendant la migration
- Testez d'abord sur un environnement de développement

### Après la réinitialisation
- Vérifiez que toutes les tables sont créées
- Configurez au moins un utilisateur avec les données par défaut
- Testez la synchronisation offline-first
- Vérifiez les politiques RLS

### Maintenance recommandée
- Exécutez `maintenance.sql` chaque semaine
- Surveillez les statistiques de performance
- Nettoyez les données soft-deleted anciennes (30+ jours)

## 🔧 Dépannage

### Erreurs communes

**"relation already exists"**
```sql
-- Si une table existe déjà, supprimez-la manuellement :
DROP TABLE IF EXISTS table_name CASCADE;
```

**"permission denied"**
```sql
-- Vérifiez que vous êtes connecté en tant que propriétaire de la base
SELECT current_user;
```

**"function does not exist"**
```sql
-- Recréez les fonctions si nécessaire :
CREATE OR REPLACE FUNCTION update_updated_at_column() ...
```

### Vérifications post-installation

```sql
-- Vérifier que toutes les tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Tester l'insertion de données
SELECT insert_default_categories_for_user('test-uuid');
```

## 📞 Support

En cas de problème avec ces scripts :
1. Vérifiez les logs d'erreur de Supabase
2. Assurez-vous d'avoir les permissions suffisantes
3. Testez étape par étape sur un environnement de développement
4. Consultez la documentation Supabase pour les spécificités RLS

---

**⚡ Prêt pour la production** : Cette architecture est optimisée pour une utilisation en production avec synchronisation offline-first robuste.