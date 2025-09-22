// Database Types
export interface Category {
  id: string
  user_id: string
  nom: string
  icone: string
  couleur: string
  ordre: number
  is_default: boolean
}

export interface ActionCustom {
  id: string
  user_id: string
  nom: string
  ordre: number
  is_default: boolean
}

export interface Task {
  id: string
  user_id: string
  titre: string
  categorie_id: string | null
  patient_initiales?: string
  patient_numero_anonymise?: string
  priorite: 'urgent' | 'normal'
  statut: 'a_faire' | 'en_cours' | 'termine'
  is_recurrente: boolean
  created_at: string
  updated_at: string
  date_completion?: string
  deleted_at?: string
  // Relations
  category?: Category
  actions?: TaskAction[]
}

export interface TaskAction {
  id: string
  tache_id: string
  texte_original?: string
  action: string
  contexte?: string
  notes?: string
  priorite: 'urgent' | 'normal'
  echeance?: string
  statut: 'a_faire' | 'fait'
  created_at: string
  updated_at: string
  date_completion?: string
  deleted_at?: string
  ordre_sequence: number
}

export interface RecurringTask {
  id: string
  user_id: string
  template_titre: string
  categorie_id: string
  template_contexte?: string
  priorite: 'urgent' | 'normal'
  frequence: 'daily' | 'weekly' | 'monthly'
  jour_semaine?: number
  jour_mois?: number
  date_debut: string
  date_fin?: string
  nb_occurrences?: number
  prochaine_generation: string
  is_active: boolean
  created_at: string
}

export interface SyncQueueItem {
  id: string
  table_name: string
  record_id: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  data: Record<string, unknown>
  created_at: string
  synced: boolean
}

// UI Types
export interface ParsedTask {
  titre: string
  action?: string
  contexte?: string
  patient_initiales?: string
  patient_numero_anonymise?: string
  priorite: 'urgent' | 'normal'
  echeance?: string
  categorie_detectee?: string
}

// Conflict Resolution Types
export interface ConflictResolution {
  entity_type: 'task' | 'action'
  entity_id: string
  local_timestamp: string
  remote_timestamp: string
  resolution: 'local_wins' | 'remote_wins' | 'merged'
  changes_applied: string[]
}

export interface SyncConflict {
  entity_type: 'task' | 'action'
  entity_id: string
  local_data: Task | TaskAction
  remote_data: Task | TaskAction
  conflict_type: 'modified' | 'deleted' | 'created'
}

export interface SyncStats {
  tasks_updated: number
  tasks_restored: number
  actions_merged: number
  conflicts_resolved: number
  resolutions: ConflictResolution[]
}

export interface FilterState {
  categories: string[]
  statuts: string[]
  priorites: string[]
  search: string
}

// Default categories and actions
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id'>[] = [
  { nom: 'Patient', icone: '👤', couleur: '#3b82f6', ordre: 1, is_default: true },
  { nom: 'Projet', icone: '📋', couleur: '#10b981', ordre: 2, is_default: true },
  { nom: 'Administratif', icone: '🏥', couleur: '#f59e0b', ordre: 3, is_default: true },
  { nom: 'Équipe', icone: '👥', couleur: '#8b5cf6', ordre: 4, is_default: true }
]

export const DEFAULT_ACTIONS: Omit<ActionCustom, 'id' | 'user_id'>[] = [
  { nom: 'APPELER', ordre: 1, is_default: true },
  { nom: 'CONTROLER', ordre: 2, is_default: true },
  { nom: 'PROGRAMMER', ordre: 3, is_default: true },
  { nom: 'REGARDER', ordre: 4, is_default: true },
  { nom: 'DISCUTER', ordre: 5, is_default: true },
  { nom: 'RENCONTRER', ordre: 6, is_default: true },
  { nom: 'ORGANISER', ordre: 7, is_default: true }
]