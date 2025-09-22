import { Timestamp, FieldValue } from 'firebase/firestore'

// Firestore-compatible types with serverTimestamp support
export interface FirebaseTask {
  id?: string // Optional pour les nouvelles tâches
  userId: string
  titre: string
  categorieId: string
  patientInitiales?: string
  patientNumeroAnonyme?: string
  priorite: 'urgent' | 'normale' | 'faible'
  statut: 'a_faire' | 'en_cours' | 'fait' | 'reporte'
  isRecurrente: boolean
  dateCompletion?: string
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
  deletedAt?: Timestamp | null
}

export interface FirebaseTaskAction {
  id?: string
  tacheId: string
  texteOriginal: string
  action: string
  contexte?: string
  priorite: 'urgent' | 'normal'
  echeance?: string
  statut: 'a_faire' | 'en_cours' | 'fait'
  ordreSequence: number
  dateCompletion?: string
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
  deletedAt?: Timestamp | null
}

export interface FirebaseCategory {
  id?: string
  userId: string
  nom: string
  couleur: string
  description?: string
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
  deletedAt?: Timestamp | null
}

export interface FirebaseActionCustom {
  id?: string
  userId: string
  nom: string
  description?: string
  contexteDefaut?: string
  prioriteDefaut: 'urgent' | 'normal'
  echeanceDefaut?: string
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
  deletedAt?: Timestamp | null
}

// Helper types for queries
export interface FirestoreQueryOptions {
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  limit?: number
  where?: Array<{
    field: string
    operator: any
    value: any
  }>
}

// Utility type to convert Firebase types to client types
export type ClientTask = Omit<FirebaseTask, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type ClientTaskAction = Omit<FirebaseTaskAction, 'createdAt' | 'updatedAt' | 'deletedAt' | 'tacheId'> & {
  tache_id: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type ClientCategory = Omit<FirebaseCategory, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type ClientActionCustom = Omit<FirebaseActionCustom, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  created_at: string
  updated_at: string
  deleted_at?: string | null
}