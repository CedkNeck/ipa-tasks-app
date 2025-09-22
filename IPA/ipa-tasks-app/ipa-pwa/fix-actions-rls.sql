-- Script de réparation RLS pour actions_tache
-- À exécuter si le problème persiste

-- Supprimer toutes les policies existantes sur actions_tache
DROP POLICY IF EXISTS "Users can view actions of their tasks" ON actions_tache;
DROP POLICY IF EXISTS "Users can insert actions to their tasks" ON actions_tache;
DROP POLICY IF EXISTS "Users can update actions of their tasks" ON actions_tache;
DROP POLICY IF EXISTS "Users can delete actions of their tasks" ON actions_tache;

-- Recréer les policies avec une approche simplifiée
CREATE POLICY "actions_select" ON actions_tache
  FOR SELECT USING (
    tache_id IN (
      SELECT id FROM taches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "actions_insert" ON actions_tache
  FOR INSERT WITH CHECK (
    tache_id IN (
      SELECT id FROM taches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "actions_update" ON actions_tache
  FOR UPDATE USING (
    tache_id IN (
      SELECT id FROM taches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "actions_delete" ON actions_tache
  FOR DELETE USING (
    tache_id IN (
      SELECT id FROM taches WHERE user_id = auth.uid()
    )
  );

-- Vérifier que RLS est activé
ALTER TABLE actions_tache ENABLE ROW LEVEL SECURITY;