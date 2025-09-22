-- =====================================================
-- SCRIPT SIMPLE D'INITIALISATION UTILISATEUR
-- =====================================================
-- Version ultra-simple pour l'interface web de Supabase

-- ÉTAPE 1: D'abord, obtenez votre UUID en exécutant cette requête :
SELECT auth.uid() as "Votre UUID utilisateur";

-- ÉTAPE 2: Remplacez 'VOTRE_UUID_ICI' par l'UUID obtenu à l'étape 1 et exécutez :

-- Insertion des catégories par défaut
SELECT insert_default_categories_for_user('VOTRE_UUID_ICI'::UUID) as "Categories inserees";

-- Insertion des actions par défaut
SELECT insert_default_actions_for_user('VOTRE_UUID_ICI'::UUID) as "Actions inserees";

-- ÉTAPE 3: Vérification (remplacez aussi l'UUID ici)
SELECT
    'Vérification' as status,
    (SELECT COUNT(*) FROM categories WHERE user_id = 'VOTRE_UUID_ICI'::UUID) as categories_count,
    (SELECT COUNT(*) FROM actions_custom WHERE user_id = 'VOTRE_UUID_ICI'::UUID) as actions_count;

-- ÉTAPE 4: Afficher les données créées (optionnel)
-- Décommentez et remplacez l'UUID pour voir le détail :

/*
SELECT 'Catégories créées:' as type, nom, icone, couleur, ordre
FROM categories
WHERE user_id = 'VOTRE_UUID_ICI'::UUID
ORDER BY ordre;

SELECT 'Actions créées:' as type, nom, ordre
FROM actions_custom
WHERE user_id = 'VOTRE_UUID_ICI'::UUID
ORDER BY ordre;
*/