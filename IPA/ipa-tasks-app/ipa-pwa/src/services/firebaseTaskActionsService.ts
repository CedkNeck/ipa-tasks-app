import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { TaskAction } from '../types'
import type { FirebaseTaskAction } from '../types/firebase'
import {
  firebaseTaskActionToClient,
  clientTaskActionToFirebase,
  createFirebaseTaskAction
} from './firestoreUtils'

export class FirebaseTaskActionsService {
  private unsubscribers: Map<string, () => void> = new Map()

  /**
   * Subscribe to real-time updates for task actions
   */
  subscribeToTaskActions(
    taskId: string,
    callback: (actions: TaskAction[]) => void
  ): () => void {
    const actionsRef = collection(db, 'taskActions')
    const q = query(
      actionsRef,
      where('tacheId', '==', taskId),
      orderBy('ordreSequence', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const actions = snapshot.docs
          .map(doc => {
            const data = doc.data() as FirebaseTaskAction
            return firebaseTaskActionToClient({ ...data, id: doc.id })
          })
          .filter(action => !action.deleted_at) // Filter out deleted actions client-side

        const source = snapshot.metadata.hasPendingWrites ? "Local" : "Server"
        console.log(`📱 Task actions for ${taskId} loaded from: ${source} (${actions.length} actions)`)

        callback(actions)
      },
      (error) => {
        console.error(`❌ Error listening to task actions for ${taskId}:`, error)
      }
    )

    return unsubscribe
  }

  /**
   * Subscribe to a single task action
   */
  subscribeToTaskAction(actionId: string, callback: (action: TaskAction | null) => void): () => void {
    const actionRef = doc(db, 'taskActions', actionId)

    const unsubscribe = onSnapshot(
      actionRef,
      { includeMetadataChanges: true },
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as FirebaseTaskAction
          const action = firebaseTaskActionToClient({ ...data, id: doc.id })

          const source = doc.metadata.hasPendingWrites ? "Local" : "Server"
          console.log(`📱 Task action ${actionId} loaded from: ${source}`)

          callback(action)
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error(`❌ Error listening to task action ${actionId}:`, error)
        callback(null)
      }
    )

    return unsubscribe
  }

  /**
   * Get task actions (one-time fetch)
   */
  async getTaskActions(taskId: string): Promise<TaskAction[]> {
    try {
      const actionsRef = collection(db, 'taskActions')
      const q = query(
        actionsRef,
        where('tacheId', '==', taskId),
          orderBy('ordreSequence', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs
        .map(doc => {
          const data = doc.data() as FirebaseTaskAction
          return firebaseTaskActionToClient({ ...data, id: doc.id })
        })
        .filter(action => !action.deleted_at) // Filter out deleted actions client-side
    } catch (error) {
      console.error('❌ Error fetching task actions:', error)
      throw error
    }
  }

  /**
   * Create a new task action
   */
  async createTaskAction(actionData: Omit<TaskAction, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }

      const firebaseAction = createFirebaseTaskAction(actionData)
      const docRef = await addDoc(collection(db, 'taskActions'), firebaseAction)

      console.log(`✅ Task action created: ${docRef.id}`)
      return docRef.id
    } catch (error) {
      console.error('❌ Error creating task action:', error)
      throw error
    }
  }

  /**
   * Update an existing task action
   */
  async updateTaskAction(actionId: string, updates: Partial<TaskAction>): Promise<void> {
    try {
      const actionRef = doc(db, 'taskActions', actionId)
      const firebaseUpdates = clientTaskActionToFirebase(updates)

      await updateDoc(actionRef, firebaseUpdates)
      console.log(`✅ Task action updated: ${actionId}`)
    } catch (error) {
      console.error(`❌ Error updating task action ${actionId}:`, error)
      throw error
    }
  }

  /**
   * Complete a task action
   */
  async completeTaskAction(actionId: string): Promise<void> {
    await this.updateTaskAction(actionId, {
      statut: 'fait',
      date_completion: new Date().toISOString()
    })
  }

  /**
   * Soft delete a task action
   */
  async deleteTaskAction(actionId: string): Promise<void> {
    try {
      const actionRef = doc(db, 'taskActions', actionId)

      await updateDoc(actionRef, {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log(`🗑️ Task action soft deleted: ${actionId}`)
    } catch (error) {
      console.error(`❌ Error deleting task action ${actionId}:`, error)
      throw error
    }
  }

  /**
   * Add an action to a task (helper method)
   */
  async addActionToTask(
    taskId: string,
    actionText: string,
    contexte?: string,
    priorite: 'urgent' | 'normal' = 'normal',
    echeance?: string
  ): Promise<string> {
    // Get existing actions to determine order
    const existingActions = await this.getTaskActions(taskId)
    const nextOrder = Math.max(...existingActions.map(a => a.ordre_sequence), 0) + 1

    return this.createTaskAction({
      tache_id: taskId,
      texte_original: actionText,
      action: actionText,
      contexte,
      priorite,
      echeance,
      statut: 'a_faire',
      ordre_sequence: nextOrder
    })
  }

  /**
   * Get action history for a task (sorted by creation date)
   */
  async getActionHistory(taskId: string): Promise<TaskAction[]> {
    try {
      const actionsRef = collection(db, 'taskActions')
      const q = query(
        actionsRef,
        where('tacheId', '==', taskId),
          orderBy('createdAt', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs
        .map(doc => {
          const data = doc.data() as FirebaseTaskAction
          return firebaseTaskActionToClient({ ...data, id: doc.id })
        })
        .filter(action => !action.deleted_at) // Filter out deleted actions client-side
    } catch (error) {
      console.error('❌ Error fetching action history:', error)
      throw error
    }
  }

  /**
   * Get the next action for a task (first pending action)
   */
  async getNextAction(taskId: string): Promise<TaskAction | null> {
    try {
      const actionsRef = collection(db, 'taskActions')
      const q = query(
        actionsRef,
        where('tacheId', '==', taskId),
          where('statut', '==', 'a_faire'),
        orderBy('ordreSequence', 'asc')
      )

      const snapshot = await getDocs(q)
      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      const data = doc.data() as FirebaseTaskAction
      return firebaseTaskActionToClient({ ...data, id: doc.id })
    } catch (error) {
      console.error('❌ Error fetching next action:', error)
      return null
    }
  }

  /**
   * Reorder task actions
   */
  async reorderActions(actionIds: string[]): Promise<void> {
    try {
      const updates = actionIds.map((actionId, index) => {
        const actionRef = doc(db, 'taskActions', actionId)
        return updateDoc(actionRef, {
          ordreSequence: index + 1,
          updatedAt: serverTimestamp()
        })
      })

      await Promise.all(updates)
      console.log('✅ Actions reordered successfully')
    } catch (error) {
      console.error('❌ Error reordering actions:', error)
      throw error
    }
  }

  /**
   * Get action statistics for a task
   */
  async getActionStats(taskId: string): Promise<{
    total: number
    completed: number
    pending: number
    urgent: number
  }> {
    try {
      const actions = await this.getTaskActions(taskId)

      const stats = {
        total: actions.length,
        completed: actions.filter(a => a.statut === 'fait').length,
        pending: actions.filter(a => a.statut === 'a_faire').length,
        urgent: actions.filter(a => a.priorite === 'urgent').length
      }

      console.log(`📊 Action stats for task ${taskId}:`, stats)
      return stats
    } catch (error) {
      console.error('❌ Error fetching action stats:', error)
      throw error
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe())
    this.unsubscribers.clear()
    console.log('🧹 TaskActionsService cleanup completed')
  }
}

// Singleton instance
export const firebaseTaskActionsService = new FirebaseTaskActionsService()