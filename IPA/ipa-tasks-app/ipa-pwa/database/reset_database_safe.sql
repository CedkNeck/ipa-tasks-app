-- =====================================================
-- SCRIPT DE RÉINITIALISATION SÉCURISÉ DE LA BASE IPA
-- =====================================================
-- Version sécurisée qui gère les erreurs et vérifie l'existence des objets

-- =====================================================
-- 1. VÉRIFICATION ET SUPPRESSION SÉCURISÉE
-- =====================================================

-- Fonction helper pour supprimer une table en toute sécurité
CREATE OR REPLACE FUNCTION safe_drop_table(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1 AND table_schema = 'public') THEN
        EXECUTE 'DROP TABLE ' || table_name || ' CASCADE';
        RAISE NOTICE 'Table % supprimée', table_name;
    ELSE
        RAISE NOTICE 'Table % n''existe pas, ignorée', table_name;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la suppression de %: %', table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Fonction helper pour supprimer une politique en toute sécurité
CREATE OR REPLACE FUNCTION safe_drop_policy(policy_name TEXT, table_name TEXT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = policy_name
        AND tablename = table_name
        AND schemaname = 'public'
    ) THEN
        EXECUTE 'DROP POLICY "' || policy_name || '" ON ' || table_name;
        RAISE NOTICE 'Politique % sur % supprimée', policy_name, table_name;
    ELSE
        RAISE NOTICE 'Politique % sur % n''existe pas', policy_name, table_name;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la suppression de la politique %: %', policy_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les politiques existantes
SELECT safe_drop_policy('Users can only see their own tasks', 'taches');
SELECT safe_drop_policy('Users can only see their own categories', 'categories');
SELECT safe_drop_policy('Users can only see their own actions', 'actions_custom');
SELECT safe_drop_policy('Users can only see their own task actions', 'actions_tache');
SELECT safe_drop_policy('Users can only see their own recurring tasks', 'recurring_tasks');
SELECT safe_drop_policy('Users can manage their own tasks', 'taches');
SELECT safe_drop_policy('Users can manage their own categories', 'categories');
SELECT safe_drop_policy('Users can manage their own custom actions', 'actions_custom');
SELECT safe_drop_policy('Users can manage task actions through parent task', 'actions_tache');
SELECT safe_drop_policy('Users can manage their own recurring tasks', 'recurring_tasks');

-- Supprimer les tables dans l'ordre des dépendances
SELECT safe_drop_table('actions_tache');
SELECT safe_drop_table('recurring_tasks');
SELECT safe_drop_table('taches');
SELECT safe_drop_table('actions_custom');
SELECT safe_drop_table('categories');

-- Supprimer les fonctions existantes en toute sécurité
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS insert_default_categories_for_user(UUID) CASCADE;
DROP FUNCTION IF EXISTS insert_default_actions_for_user(UUID) CASCADE;
DROP FUNCTION IF EXISTS cleanup_soft_deleted_data(INTEGER) CASCADE;

-- Supprimer les vues existantes
DROP VIEW IF EXISTS active_tasks_with_actions CASCADE;

-- Nettoyer les fonctions helper
DROP FUNCTION safe_drop_table(TEXT);
DROP FUNCTION safe_drop_policy(TEXT, TEXT);

-- =====================================================
-- 2. CRÉATION DES TABLES AVEC LA NOUVELLE ARCHITECTURE
-- =====================================================

-- Table des catégories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    icone VARCHAR(10) NOT NULL,
    couleur VARCHAR(7) NOT NULL, -- Format hex: #RRGGBB
    ordre INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- Table des actions personnalisées
CREATE TABLE actions_custom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nom VARCHAR(200) NOT NULL,
    ordre INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- Table des tâches (conteneurs neutres)
CREATE TABLE taches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titre VARCHAR(500) NOT NULL,
    categorie_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    patient_initiales VARCHAR(10) NULL,
    patient_numero_anonymise VARCHAR(20) NULL,
    priorite VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priorite IN ('urgent', 'normal')),
    statut VARCHAR(15) NOT NULL DEFAULT 'a_faire' CHECK (statut IN ('a_faire', 'en_cours', 'termine')),
    echeance_actuelle TIMESTAMPTZ NULL,
    is_recurrente BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_completion TIMESTAMPTZ NULL,
    deleted_at TIMESTAMPTZ NULL
);

-- Table des actions de tâches (composants évolutifs)
CREATE TABLE actions_tache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tache_id UUID NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
    texte_original TEXT NULL, -- Texte original saisi par l'utilisateur
    action VARCHAR(500) NOT NULL, -- Action extraite/analysée
    contexte TEXT NULL, -- Contexte de l'action
    notes TEXT NULL, -- Notes additionnelles
    priorite VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priorite IN ('urgent', 'normal')),
    echeance TIMESTAMPTZ NULL, -- Échéance spécifique à cette action
    statut VARCHAR(10) NOT NULL DEFAULT 'a_faire' CHECK (statut IN ('a_faire', 'fait')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_completion TIMESTAMPTZ NULL,
    deleted_at TIMESTAMPTZ NULL,
    ordre_sequence INTEGER NOT NULL DEFAULT 1 -- Ordre dans la séquence d'actions
);

-- Table des tâches récurrentes
CREATE TABLE recurring_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_titre VARCHAR(500) NOT NULL,
    categorie_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    template_contexte TEXT NULL,
    priorite VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priorite IN ('urgent', 'normal')),
    frequence VARCHAR(20) NOT NULL CHECK (frequence IN ('daily', 'weekly', 'monthly')),
    jour_semaine INTEGER NULL CHECK (jour_semaine BETWEEN 0 AND 6), -- 0=dimanche, 1=lundi, etc.
    jour_mois INTEGER NULL CHECK (jour_mois BETWEEN 1 AND 31),
    heure_execution TIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    derniere_execution TIMESTAMPTZ NULL,
    prochaine_execution TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- =====================================================
-- 3. CRÉATION DES INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour les catégories
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_user_active ON categories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_ordre ON categories(user_id, ordre) WHERE deleted_at IS NULL;

-- Index pour les actions custom
CREATE INDEX idx_actions_custom_user_id ON actions_custom(user_id);
CREATE INDEX idx_actions_custom_user_active ON actions_custom(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_actions_custom_ordre ON actions_custom(user_id, ordre) WHERE deleted_at IS NULL;

-- Index pour les tâches
CREATE INDEX idx_taches_user_id ON taches(user_id);
CREATE INDEX idx_taches_user_active ON taches(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_taches_statut ON taches(user_id, statut) WHERE deleted_at IS NULL;
CREATE INDEX idx_taches_priorite ON taches(user_id, priorite) WHERE deleted_at IS NULL;
CREATE INDEX idx_taches_echeance ON taches(echeance_actuelle) WHERE deleted_at IS NULL;
CREATE INDEX idx_taches_categorie ON taches(categorie_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_taches_sync ON taches(user_id, updated_at) WHERE deleted_at IS NULL;

-- Index pour les actions de tâches
CREATE INDEX idx_actions_tache_tache_id ON actions_tache(tache_id);
CREATE INDEX idx_actions_tache_active ON actions_tache(tache_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_actions_tache_statut ON actions_tache(tache_id, statut) WHERE deleted_at IS NULL;
CREATE INDEX idx_actions_tache_ordre ON actions_tache(tache_id, ordre_sequence) WHERE deleted_at IS NULL;
CREATE INDEX idx_actions_tache_sync ON actions_tache(updated_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_actions_tache_join ON actions_tache(tache_id, updated_at);

-- Index pour les tâches récurrentes
CREATE INDEX idx_recurring_tasks_user_id ON recurring_tasks(user_id);
CREATE INDEX idx_recurring_tasks_active ON recurring_tasks(user_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_recurring_tasks_execution ON recurring_tasks(prochaine_execution) WHERE is_active = true AND deleted_at IS NULL;

-- Index pour les soft deletes et la synchronisation
CREATE INDEX idx_taches_deleted_at ON taches(deleted_at);
CREATE INDEX idx_actions_tache_deleted_at ON actions_tache(deleted_at);
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at);
CREATE INDEX idx_actions_custom_deleted_at ON actions_custom(deleted_at);

-- =====================================================
-- 4. TRIGGERS POUR UPDATED_AT AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour chaque table
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actions_custom_updated_at
    BEFORE UPDATE ON actions_custom
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_taches_updated_at
    BEFORE UPDATE ON taches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actions_tache_updated_at
    BEFORE UPDATE ON actions_tache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_tasks_updated_at
    BEFORE UPDATE ON recurring_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ACTIVATION DU ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions_custom ENABLE ROW LEVEL SECURITY;
ALTER TABLE taches ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions_tache ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. POLITIQUES RLS OPTIMISÉES POUR LE SOFT DELETE
-- =====================================================

-- Politiques pour les catégories
CREATE POLICY "Users can manage their own categories" ON categories
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour les actions custom
CREATE POLICY "Users can manage their own custom actions" ON actions_custom
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour les tâches
CREATE POLICY "Users can manage their own tasks" ON taches
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour les actions de tâches (via la tâche parente)
CREATE POLICY "Users can manage task actions through parent task" ON actions_tache
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM taches
            WHERE taches.id = actions_tache.tache_id
            AND taches.user_id = auth.uid()
        )
    );

-- Politiques pour les tâches récurrentes
CREATE POLICY "Users can manage their own recurring tasks" ON recurring_tasks
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 7. INSERTION DES DONNÉES PAR DÉFAUT
-- =====================================================

-- Fonction pour insérer les catégories par défaut pour un utilisateur
CREATE OR REPLACE FUNCTION insert_default_categories_for_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO categories (user_id, nom, icone, couleur, ordre, is_default) VALUES
    (target_user_id, 'Consultation', '🩺', '#3B82F6', 1, true),
    (target_user_id, 'Administration', '📋', '#8B5CF6', 2, true),
    (target_user_id, 'Urgence', '🚨', '#EF4444', 3, true),
    (target_user_id, 'Formation', '📚', '#10B981', 4, true),
    (target_user_id, 'Recherche', '🔬', '#F59E0B', 5, true);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour insérer les actions par défaut pour un utilisateur
CREATE OR REPLACE FUNCTION insert_default_actions_for_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO actions_custom (user_id, nom, ordre, is_default) VALUES
    (target_user_id, 'Appeler le patient', 1, true),
    (target_user_id, 'Préparer le dossier', 2, true),
    (target_user_id, 'Rédiger le compte-rendu', 3, true),
    (target_user_id, 'Prescrire un traitement', 4, true),
    (target_user_id, 'Planifier un suivi', 5, true),
    (target_user_id, 'Contacter un spécialiste', 6, true),
    (target_user_id, 'Mettre à jour le dossier', 7, true);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. FONCTION DE NETTOYAGE AUTOMATIQUE
-- =====================================================

-- Fonction pour nettoyer les données soft-deleted anciennes
CREATE OR REPLACE FUNCTION cleanup_soft_deleted_data(days_threshold INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    total_deleted INTEGER := 0;
    deleted_count INTEGER;
BEGIN
    -- Nettoyer les actions de tâches soft-deleted depuis plus de X jours
    DELETE FROM actions_tache
    WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '1 day' * days_threshold;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;

    -- Nettoyer les tâches soft-deleted depuis plus de X jours
    DELETE FROM taches
    WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '1 day' * days_threshold;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;

    -- Nettoyer les catégories soft-deleted depuis plus de X jours
    DELETE FROM categories
    WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '1 day' * days_threshold;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;

    -- Nettoyer les actions custom soft-deleted depuis plus de X jours
    DELETE FROM actions_custom
    WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '1 day' * days_threshold;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;

    RETURN total_deleted;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCRIPT TERMINÉ
-- =====================================================

SELECT 'Base de données IPA réinitialisée avec succès!' as message;
SELECT 'Tables créées: categories, actions_custom, taches, actions_tache, recurring_tasks' as tables_created;
SELECT 'Utilisation: Exécutez setup_user_defaults.sql pour initialiser un utilisateur' as next_step;