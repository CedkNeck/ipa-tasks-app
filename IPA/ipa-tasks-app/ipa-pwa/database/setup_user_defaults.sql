-- =====================================================
-- SCRIPT D'INITIALISATION DES DONNÉES PAR DÉFAUT
-- =====================================================
-- À exécuter après la création d'un nouvel utilisateur
-- Compatible avec l'interface web de Supabase

-- ⚠️ IMPORTANT: Remplacez 'YOUR_USER_ID_HERE' par votre UUID réel dans la ligne suivante
-- Vous pouvez obtenir l'UUID en vous connectant et en exécutant: SELECT auth.uid();

DO $$
DECLARE
    target_user_id UUID := 'YOUR_USER_ID_HERE'; -- ⬅️ REMPLACEZ PAR VOTRE UUID
BEGIN
    -- Vérifier que l'UUID est valide
    IF target_user_id = 'YOUR_USER_ID_HERE' THEN
        RAISE EXCEPTION 'Veuillez remplacer YOUR_USER_ID_HERE par votre UUID réel dans le script !';
    END IF;

    -- =====================================================
    -- INSERTION DES CATÉGORIES PAR DÉFAUT
    -- =====================================================

    PERFORM insert_default_categories_for_user(target_user_id);
    RAISE NOTICE 'Catégories par défaut insérées pour l''utilisateur %', target_user_id;

    -- =====================================================
    -- INSERTION DES ACTIONS PAR DÉFAUT
    -- =====================================================

    PERFORM insert_default_actions_for_user(target_user_id);
    RAISE NOTICE 'Actions par défaut insérées pour l''utilisateur %', target_user_id;

    RAISE NOTICE 'Initialisation terminée avec succès !';
END $$;

-- =====================================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- =====================================================

-- ⚠️ REMPLACEZ AUSSI L'UUID ICI POUR LA VÉRIFICATION
WITH user_data AS (
    SELECT 'YOUR_USER_ID_HERE'::UUID as user_id -- ⬅️ REMPLACEZ PAR VOTRE UUID
)
SELECT
    'Résumé de l''initialisation' as section,
    (SELECT COUNT(*) FROM categories c, user_data u WHERE c.user_id = u.user_id) as categories_creees,
    (SELECT COUNT(*) FROM actions_custom ac, user_data u WHERE ac.user_id = u.user_id) as actions_creees;

-- Afficher les catégories créées (remplacez l'UUID)
-- SELECT nom, icone, couleur, ordre
-- FROM categories
-- WHERE user_id = 'YOUR_USER_ID_HERE'::UUID
-- ORDER BY ordre;

-- Afficher les actions créées (remplacez l'UUID)
-- SELECT nom, ordre
-- FROM actions_custom
-- WHERE user_id = 'YOUR_USER_ID_HERE'::UUID
-- ORDER BY ordre;