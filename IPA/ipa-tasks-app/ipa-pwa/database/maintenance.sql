-- =====================================================
-- SCRIPT DE MAINTENANCE DE LA BASE DE DONNÉES IPA
-- =====================================================
-- Scripts utilitaires pour la maintenance régulière

-- =====================================================
-- 1. NETTOYAGE DES DONNÉES SOFT-DELETED
-- =====================================================

-- Nettoyer les données soft-deleted de plus de 30 jours
SELECT cleanup_soft_deleted_data(30) as "Enregistrements supprimés définitivement";

-- =====================================================
-- 2. STATISTIQUES DE LA BASE
-- =====================================================

-- Statistiques générales par utilisateur
SELECT
    u.email,
    COUNT(DISTINCT t.id) as taches_total,
    COUNT(DISTINCT CASE WHEN t.deleted_at IS NULL THEN t.id END) as taches_actives,
    COUNT(DISTINCT CASE WHEN t.deleted_at IS NOT NULL THEN t.id END) as taches_supprimees,
    COUNT(DISTINCT at.id) as actions_total,
    COUNT(DISTINCT CASE WHEN at.deleted_at IS NULL THEN at.id END) as actions_actives
FROM auth.users u
LEFT JOIN taches t ON u.id = t.user_id
LEFT JOIN actions_tache at ON t.id = at.tache_id
GROUP BY u.id, u.email
ORDER BY taches_total DESC;

-- =====================================================
-- 3. STATISTIQUES DE SYNCHRONISATION
-- =====================================================

-- Activité récente par table (dernières 24h)
SELECT
    'taches' as table_name,
    COUNT(*) as modifications_24h
FROM taches
WHERE updated_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT
    'actions_tache' as table_name,
    COUNT(*) as modifications_24h
FROM actions_tache
WHERE updated_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT
    'categories' as table_name,
    COUNT(*) as modifications_24h
FROM categories
WHERE updated_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT
    'actions_custom' as table_name,
    COUNT(*) as modifications_24h
FROM actions_custom
WHERE updated_at > NOW() - INTERVAL '24 hours';

-- =====================================================
-- 4. DÉTECTION D'ANOMALIES
-- =====================================================

-- Tâches sans catégorie (potentiellement problématiques)
SELECT
    COUNT(*) as taches_sans_categorie,
    'Tâches actives sans catégorie assignée' as description
FROM taches
WHERE categorie_id IS NULL
AND deleted_at IS NULL;

-- Actions orphelines (actions dont la tâche parente n'existe plus)
SELECT
    COUNT(*) as actions_orphelines,
    'Actions dont la tâche parente a été supprimée' as description
FROM actions_tache at
LEFT JOIN taches t ON at.tache_id = t.id
WHERE t.id IS NULL
AND at.deleted_at IS NULL;

-- Tâches avec actions mais aucune action active
SELECT
    COUNT(*) as taches_sans_actions_actives,
    'Tâches ayant des actions mais toutes supprimées' as description
FROM taches t
WHERE EXISTS (
    SELECT 1 FROM actions_tache at
    WHERE at.tache_id = t.id
)
AND NOT EXISTS (
    SELECT 1 FROM actions_tache at
    WHERE at.tache_id = t.id
    AND at.deleted_at IS NULL
)
AND t.deleted_at IS NULL;

-- =====================================================
-- 5. OPTIMISATION DES PERFORMANCES
-- =====================================================

-- Analyser les tables pour optimiser le query planner
ANALYZE categories;
ANALYZE actions_custom;
ANALYZE taches;
ANALYZE actions_tache;
ANALYZE recurring_tasks;

-- Afficher les index les plus utilisés
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as "Utilisations",
    idx_tup_read as "Tuples lus",
    idx_tup_fetch as "Tuples récupérés"
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND tablename IN ('taches', 'actions_tache', 'categories', 'actions_custom')
ORDER BY idx_scan DESC;

-- =====================================================
-- 6. VÉRIFICATION DE L'INTÉGRITÉ
-- =====================================================

-- Vérifier la cohérence des timestamps
SELECT
    'Vérification des timestamps' as check_type,
    COUNT(*) as anomalies_detectees
FROM taches
WHERE updated_at < created_at
OR (date_completion IS NOT NULL AND date_completion < created_at)
OR (deleted_at IS NOT NULL AND deleted_at < created_at);

-- Vérifier les références de catégories
SELECT
    'Références de catégories invalides' as check_type,
    COUNT(*) as anomalies_detectees
FROM taches t
LEFT JOIN categories c ON t.categorie_id = c.id
WHERE t.categorie_id IS NOT NULL
AND c.id IS NULL
AND t.deleted_at IS NULL;

-- =====================================================
-- SCRIPT TERMINÉ
-- =====================================================

SELECT 'Maintenance terminée - ' || NOW()::timestamp as message;