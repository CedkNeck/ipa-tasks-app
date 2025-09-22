import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Task, ParsedTask } from '../types'
import type { FirebaseTask } from '../types/firebase'
import {
  firebaseTaskToClient,
  clientTaskToFirebase,
  createFirebaseTask
} from './firestoreUtils'
import { firebaseTaskActionsService } from './firebaseTaskActionsService'

export class FirebaseTaskService {
  private unsubscribers: Map<string, () => void> = new Map()

  /**
   * Subscribe to real-time updates for user tasks
   */
  subscribeToTasks(
    userId: string,
    callback: (tasks: Task[]) => void,
    options?: {
      includeCompleted?: boolean
      categoryId?: string
      limit?: number
    }
  ): () => void {
    const tasksRef = collection(db, 'tasks')

    let q = query(
      tasksRef,
      where('userId', '==', userId)
    )

    // Add optional filters
    if (options?.categoryId) {
      q = query(q, where('categorieId', '==', options.categoryId))
    }

    // Order by creation date
    q = query(q, orderBy('createdAt', 'desc'))

    if (options?.limit) {
      q = query(q, limit(options.limit))
    }

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      async (snapshot) => {
        const tasks = snapshot.docs
          .map(doc => {
            const data = doc.data() as FirebaseTask
            return firebaseTaskToClient({ ...data, id: doc.id })
          })
          .filter(task => !task.deleted_at) // Filter out deleted tasks client-side
          .filter(task => options?.includeCompleted || task.statut === 'a_faire' || task.statut === 'en_cours') // Filter completed tasks client-side

        // Load actions for each task
        const tasksWithActions = await Promise.all(
          tasks.map(async (task) => {
            try {
              const actions = await firebaseTaskActionsService.getTaskActions(task.id)
              return { ...task, actions }
            } catch (error) {
              console.error(`❌ Error loading actions for task ${task.id}:`, error)
              return task
            }
          })
        )

        // Log sync status for debugging
        const source = snapshot.metadata.hasPendingWrites ? "Local" : "Server"
        console.log(`📱 Tasks loaded from: ${source} (${tasksWithActions.length} tasks)`)

        callback(tasksWithActions)
      },
      (error) => {
        console.error('❌ Error listening to tasks:', error)
      }
    )

    return unsubscribe
  }

  /**
   * Subscribe to a single task
   */
  subscribeToTask(taskId: string, callback: (task: Task | null) => void): () => void {
    const taskRef = doc(db, 'tasks', taskId)

    const unsubscribe = onSnapshot(
      taskRef,
      { includeMetadataChanges: true },
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as FirebaseTask
          const task = firebaseTaskToClient({ ...data, id: doc.id })

          const source = doc.metadata.hasPendingWrites ? "Local" : "Server"
          console.log(`📱 Task ${taskId} loaded from: ${source}`)

          callback(task)
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error(`❌ Error listening to task ${taskId}:`, error)
        callback(null)
      }
    )

    return unsubscribe
  }

  /**
   * Create a new task
   */
  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>, parsedTaskData?: Pick<ParsedTask, 'action' | 'contexte'> & { echeance?: string }): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }

      const firebaseTask = createFirebaseTask({
        ...taskData,
        user_id: auth.currentUser.uid
      })

      const docRef = await addDoc(collection(db, 'tasks'), firebaseTask)
      console.log(`✅ Task created: ${docRef.id}`)

      // Create a default action if one was parsed
      if (parsedTaskData?.action) {
        try {
          await firebaseTaskActionsService.addActionToTask(
            docRef.id,
            parsedTaskData.action,
            parsedTaskData.contexte, // Include parsed context
            taskData.priorite,
            parsedTaskData.echeance // Use the parsed task's deadline for the action
          )
          console.log(`✅ Task action created for task: ${docRef.id}`)
        } catch (actionError) {
          console.error('❌ Error creating task action:', actionError)
          // Don't throw here, task creation was successful
        }
      }

      return docRef.id
    } catch (error) {
      console.error('❌ Error creating task:', error)
      throw error
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      const firebaseUpdates = clientTaskToFirebase(updates)

      await updateDoc(taskRef, firebaseUpdates)
      console.log(`✅ Task updated: ${taskId}`)
    } catch (error) {
      console.error(`❌ Error updating task ${taskId}:`, error)
      throw error
    }
  }

  /**
   * Soft delete a task (set deletedAt timestamp)
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId)

      await updateDoc(taskRef, {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log(`🗑️ Task soft deleted: ${taskId}`)
    } catch (error) {
      console.error(`❌ Error deleting task ${taskId}:`, error)
      throw error
    }
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string): Promise<void> {
    await this.updateTask(taskId, {
      statut: 'termine',
      date_completion: new Date().toISOString()
    })
  }

  /**
   * Get tasks by category (one-time fetch)
   */
  async getTasksByCategory(userId: string, categoryId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef,
        where('userId', '==', userId),
        where('categorieId', '==', categoryId)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data() as FirebaseTask
        return firebaseTaskToClient({ ...data, id: doc.id })
      })
    } catch (error) {
      console.error('❌ Error fetching tasks by category:', error)
      throw error
    }
  }

  /**
   * Get user's task statistics
   */
  async getTaskStats(userId: string): Promise<{
    total: number
    completed: number
    pending: number
    urgent: number
  }> {
    try {
      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef,
        where('userId', '==', userId)
      )

      const snapshot = await getDocs(q)
      const tasks = snapshot.docs.map(doc => doc.data() as FirebaseTask)

      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.statut === 'termine').length,
        pending: tasks.filter(t => t.statut !== 'termine').length,
        urgent: tasks.filter(t => t.priorite === 'urgent').length
      }

      console.log('📊 Task stats:', stats)
      return stats
    } catch (error) {
      console.error('❌ Error fetching task stats:', error)
      throw error
    }
  }

  /**
   * Get connection status (always returns true with Firestore)
   */
  getConnectionStatus(): { isOnline: boolean; isSyncing: boolean } {
    return {
      isOnline: navigator.onLine, // Browser connectivity
      isSyncing: false // Firestore handles sync automatically
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe())
    this.unsubscribers.clear()
    console.log('🧹 TaskService cleanup completed')
  }

  /**
   * Check if we have pending writes (useful for UI feedback)
   */
  hasPendingWrites(): boolean {
    // This would need to be tracked at the component level
    // using the metadata from onSnapshot
    return false
  }
}

// Singleton instance
export const firebaseTaskService = new FirebaseTaskService()