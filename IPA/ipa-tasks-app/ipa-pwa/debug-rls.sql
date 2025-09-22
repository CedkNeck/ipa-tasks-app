-- Script de diagnostic pour vérifier les policies RLS
-- À exécuter dans l'éditeur SQL de Supabase pour diagnostiquer le problème

-- 1. Vérifier si RLS est activé sur actions_tache
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'actions_tache';

-- 2. Lister toutes les policies sur actions_tache
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'actions_tache';

-- 3. Vérifier la structure de la table actions_tache
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'actions_tache'
ORDER BY ordinal_position;

-- 4. Vérifier la structure de la table taches
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'taches'
ORDER BY ordinal_position;

-- 5. Tester la policy manuellement (remplace USER_ID par ton vrai user_id)
-- SELECT
--   EXISTS (
--     SELECT 1 FROM taches
--     WHERE taches.id = 'TASK_ID_HERE'
--     AND taches.user_id = 'USER_ID_HERE'
--   ) as policy_check;

-- 6. Vérifier s'il y a des données de test
SELECT COUNT(*) as task_count FROM taches;
SELECT COUNT(*) as action_count FROM actions_tache;

-- 7. Vérifier les contraintes de clés étrangères
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name='actions_tache';