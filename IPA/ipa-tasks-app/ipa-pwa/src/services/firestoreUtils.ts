import { Timestamp, serverTimestamp } from 'firebase/firestore'
import type {
  FirebaseTask,
  FirebaseTaskAction,
  FirebaseCategory,
  FirebaseActionCustom,
  ClientTask,
  ClientTaskAction,
  ClientCategory,
  ClientActionCustom
} from '../types/firebase'
import type { Task, TaskAction, Category, ActionCustom } from '../types'

// Convert Firestore Timestamp to ISO string
const timestampToString = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString()
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString()
  }
  return timestamp
}

// Convert Firebase Task to Client Task
export const firebaseTaskToClient = (firebaseTask: FirebaseTask & { id: string }): Task => ({
  id: firebaseTask.id,
  user_id: firebaseTask.userId,
  titre: firebaseTask.titre,
  categorie_id: firebaseTask.categorieId,
  patient_initiales: firebaseTask.patientInitiales,
  patient_numero_anonymise: firebaseTask.patientNumeroAnonyme,
  priorite: firebaseTask.priorite,
  statut: firebaseTask.statut,
  is_recurrente: firebaseTask.isRecurrente,
  date_completion: firebaseTask.dateCompletion,
  created_at: timestampToString(firebaseTask.createdAt),
  updated_at: timestampToString(firebaseTask.updatedAt),
  deleted_at: firebaseTask.deletedAt ? timestampToString(firebaseTask.deletedAt) : undefined
})

// Convert Client Task to Firebase Task
export const clientTaskToFirebase = (clientTask: Partial<Task>): Partial<FirebaseTask> => {
  const firebaseData: Partial<FirebaseTask> = {
    updatedAt: serverTimestamp()
  }

  // Only add fields if they're not undefined
  if (clientTask.user_id !== undefined) {
    firebaseData.userId = clientTask.user_id
  }

  if (clientTask.titre !== undefined) {
    firebaseData.titre = clientTask.titre
  }

  if (clientTask.priorite !== undefined) {
    firebaseData.priorite = clientTask.priorite
  }

  if (clientTask.statut !== undefined) {
    firebaseData.statut = clientTask.statut
  }

  if (clientTask.categorie_id !== undefined) {
    firebaseData.categorieId = clientTask.categorie_id
  }

  if (clientTask.patient_initiales !== undefined) {
    firebaseData.patientInitiales = clientTask.patient_initiales
  }

  if (clientTask.patient_numero_anonymise !== undefined) {
    firebaseData.patientNumeroAnonyme = clientTask.patient_numero_anonymise
  }

  if (clientTask.is_recurrente !== undefined) {
    firebaseData.isRecurrente = clientTask.is_recurrente
  }

  if (clientTask.date_completion !== undefined) {
    firebaseData.dateCompletion = clientTask.date_completion
  }

  // Add deletedAt if present
  if (clientTask.deleted_at) {
    firebaseData.deletedAt = serverTimestamp()
  }

  return firebaseData
}

// Convert Firebase TaskAction to Client TaskAction
export const firebaseTaskActionToClient = (firebaseAction: FirebaseTaskAction & { id: string }): TaskAction => ({
  id: firebaseAction.id,
  tache_id: firebaseAction.tacheId,
  texte_original: firebaseAction.texteOriginal,
  action: firebaseAction.action,
  contexte: firebaseAction.contexte,
  priorite: firebaseAction.priorite,
  echeance: firebaseAction.echeance,
  statut: firebaseAction.statut,
  ordre_sequence: firebaseAction.ordreSequence,
  date_completion: firebaseAction.dateCompletion,
  created_at: timestampToString(firebaseAction.createdAt),
  updated_at: timestampToString(firebaseAction.updatedAt),
  deleted_at: firebaseAction.deletedAt ? timestampToString(firebaseAction.deletedAt) : undefined
})

// Convert Client TaskAction to Firebase TaskAction
export const clientTaskActionToFirebase = (clientAction: Partial<TaskAction>): Partial<FirebaseTaskAction> => {
  const firebaseData: Partial<FirebaseTaskAction> = {
    updatedAt: serverTimestamp()
  }

  // Only add fields if they're not undefined
  if (clientAction.tache_id !== undefined) {
    firebaseData.tacheId = clientAction.tache_id
  }

  if (clientAction.action !== undefined) {
    firebaseData.action = clientAction.action
  }

  if (clientAction.priorite !== undefined) {
    firebaseData.priorite = clientAction.priorite
  }

  if (clientAction.statut !== undefined) {
    firebaseData.statut = clientAction.statut
  }

  if (clientAction.texte_original !== undefined) {
    firebaseData.texteOriginal = clientAction.texte_original
  }

  if (clientAction.contexte !== undefined) {
    firebaseData.contexte = clientAction.contexte
  }

  if (clientAction.echeance !== undefined) {
    firebaseData.echeance = clientAction.echeance
  }

  if (clientAction.ordre_sequence !== undefined) {
    firebaseData.ordreSequence = clientAction.ordre_sequence
  }

  if (clientAction.date_completion !== undefined) {
    firebaseData.dateCompletion = clientAction.date_completion
  }

  // Add deletedAt if present
  if (clientAction.deleted_at) {
    firebaseData.deletedAt = serverTimestamp()
  }

  return firebaseData
}

// Convert Firebase Category to Client Category
export const firebaseCategoryToClient = (firebaseCategory: FirebaseCategory & { id: string }): Category => ({
  id: firebaseCategory.id,
  user_id: firebaseCategory.userId,
  nom: firebaseCategory.nom,
  couleur: firebaseCategory.couleur,
  description: firebaseCategory.description,
  created_at: timestampToString(firebaseCategory.createdAt),
  updated_at: timestampToString(firebaseCategory.updatedAt),
  deleted_at: firebaseCategory.deletedAt ? timestampToString(firebaseCategory.deletedAt) : undefined
})

// Convert Client Category to Firebase Category
export const clientCategoryToFirebase = (clientCategory: Partial<Category>): Partial<FirebaseCategory> => ({
  userId: clientCategory.user_id,
  nom: clientCategory.nom,
  couleur: clientCategory.couleur,
  description: clientCategory.description,
  updatedAt: serverTimestamp(),
  ...(clientCategory.deleted_at && { deletedAt: serverTimestamp() })
})

// Convert Firebase ActionCustom to Client ActionCustom
export const firebaseActionCustomToClient = (firebaseAction: FirebaseActionCustom & { id: string }): ActionCustom => ({
  id: firebaseAction.id,
  user_id: firebaseAction.userId,
  nom: firebaseAction.nom,
  description: firebaseAction.description,
  contexte_defaut: firebaseAction.contexteDefaut,
  priorite_defaut: firebaseAction.prioriteDefaut,
  echeance_defaut: firebaseAction.echeanceDefaut,
  created_at: timestampToString(firebaseAction.createdAt),
  updated_at: timestampToString(firebaseAction.updatedAt),
  deleted_at: firebaseAction.deletedAt ? timestampToString(firebaseAction.deletedAt) : undefined
})

// Convert Client ActionCustom to Firebase ActionCustom
export const clientActionCustomToFirebase = (clientAction: Partial<ActionCustom>): Partial<FirebaseActionCustom> => {
  const firebaseData: Partial<FirebaseActionCustom> = {
    userId: clientAction.user_id,
    nom: clientAction.nom,
    description: clientAction.description,
    contexteDefaut: clientAction.contexte_defaut,
    prioriteDefaut: clientAction.priorite_defaut,
    updatedAt: serverTimestamp()
  }

  // Only add echeanceDefaut if it's not undefined
  if (clientAction.echeance_defaut !== undefined) {
    firebaseData.echeanceDefaut = clientAction.echeance_defaut
  }

  // Add deletedAt if present
  if (clientAction.deleted_at) {
    firebaseData.deletedAt = serverTimestamp()
  }

  return firebaseData
}

// Helper for creating new documents with timestamps
export const createFirebaseTask = (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Omit<FirebaseTask, 'id'> => ({
  ...clientTaskToFirebase(taskData),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
} as Omit<FirebaseTask, 'id'>)

export const createFirebaseTaskAction = (actionData: Omit<TaskAction, 'id' | 'created_at' | 'updated_at'>): Omit<FirebaseTaskAction, 'id'> => ({
  ...clientTaskActionToFirebase(actionData),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
} as Omit<FirebaseTaskAction, 'id'>)

export const createFirebaseCategory = (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Omit<FirebaseCategory, 'id'> => ({
  ...clientCategoryToFirebase(categoryData),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
} as Omit<FirebaseCategory, 'id'>)

export const createFirebaseActionCustom = (actionData: Omit<ActionCustom, 'id' | 'created_at' | 'updated_at'>): Omit<FirebaseActionCustom, 'id'> => ({
  ...clientActionCustomToFirebase(actionData),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
} as Omit<FirebaseActionCustom, 'id'>)