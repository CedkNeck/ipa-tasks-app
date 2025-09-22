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
import type { ActionCustom } from '../types'
import type { FirebaseActionCustom } from '../types/firebase'
import {
  firebaseActionCustomToClient,
  clientActionCustomToFirebase,
  createFirebaseActionCustom
} from './firestoreUtils'

export class FirebaseActionsCustomService {
  private unsubscribers: Map<string, () => void> = new Map()

  /**
   * Subscribe to real-time updates for user custom actions
   */
  subscribeToActionsCustom(
    userId: string,
    callback: (actions: ActionCustom[]) => void
  ): () => void {
    const actionsRef = collection(db, 'actionsCustom')
    const q = query(
      actionsRef,
      where('userId', '==', userId),
      where('deletedAt', '==', null),
      orderBy('nom', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const actions = snapshot.docs.map(doc => {
          const data = doc.data() as FirebaseActionCustom
          return firebaseActionCustomToClient({ ...data, id: doc.id })
        })

        const source = snapshot.metadata.hasPendingWrites ? "Local" : "Server"
        console.log(`📱 Custom actions loaded from: ${source} (${actions.length} actions)`)

        callback(actions)
      },
      (error) => {
        console.error('❌ Error listening to custom actions:', error)
      }
    )

    return unsubscribe
  }

  /**
   * Get custom actions (one-time fetch)
   */
  async getActionsCustom(userId: string): Promise<ActionCustom[]> {
    try {
      const actionsRef = collection(db, 'actionsCustom')
      const q = query(
        actionsRef,
        where('userId', '==', userId),
        where('deletedAt', '==', null),
        orderBy('nom', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data() as FirebaseActionCustom
        return firebaseActionCustomToClient({ ...data, id: doc.id })
      })
    } catch (error) {
      console.error('❌ Error fetching custom actions:', error)
      throw error
    }
  }

  /**
   * Create a new custom action
   */
  async createActionCustom(actionData: Omit<ActionCustom, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }

      const firebaseAction = createFirebaseActionCustom({
        ...actionData,
        user_id: auth.currentUser.uid
      })

      const docRef = await addDoc(collection(db, 'actionsCustom'), firebaseAction)
      console.log(`✅ Custom action created: ${docRef.id}`)

      return docRef.id
    } catch (error) {
      console.error('❌ Error creating custom action:', error)
      throw error
    }
  }

  /**
   * Update an existing custom action
   */
  async updateActionCustom(actionId: string, updates: Partial<ActionCustom>): Promise<void> {
    try {
      const actionRef = doc(db, 'actionsCustom', actionId)
      const firebaseUpdates = clientActionCustomToFirebase(updates)

      await updateDoc(actionRef, firebaseUpdates)
      console.log(`✅ Custom action updated: ${actionId}`)
    } catch (error) {
      console.error(`❌ Error updating custom action ${actionId}:`, error)
      throw error
    }
  }

  /**
   * Soft delete a custom action
   */
  async deleteActionCustom(actionId: string): Promise<void> {
    try {
      const actionRef = doc(db, 'actionsCustom', actionId)

      await updateDoc(actionRef, {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log(`🗑️ Custom action soft deleted: ${actionId}`)
    } catch (error) {
      console.error(`❌ Error deleting custom action ${actionId}:`, error)
      throw error
    }
  }

  /**
   * Get popular custom actions (by usage)
   */
  async getPopularActions(userId: string, limit: number = 10): Promise<ActionCustom[]> {
    try {
      // For now, just return all actions ordered by name
      // Later we could add usage tracking
      const actionsRef = collection(db, 'actionsCustom')
      const q = query(
        actionsRef,
        where('userId', '==', userId),
        where('deletedAt', '==', null),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const actions = snapshot.docs.map(doc => {
        const data = doc.data() as FirebaseActionCustom
        return firebaseActionCustomToClient({ ...data, id: doc.id })
      })

      return actions.slice(0, limit)
    } catch (error) {
      console.error('❌ Error fetching popular actions:', error)
      throw error
    }
  }

  /**
   * Search custom actions by name
   */
  async searchActions(userId: string, searchTerm: string): Promise<ActionCustom[]> {
    try {
      const actions = await this.getActionsCustom(userId)

      const filteredActions = actions.filter(action =>
        action.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      console.log(`🔍 Found ${filteredActions.length} actions matching "${searchTerm}"`)
      return filteredActions
    } catch (error) {
      console.error('❌ Error searching actions:', error)
      throw error
    }
  }

  /**
   * Create default custom actions for new user
   */
  async createDefaultActions(userId: string): Promise<string[]> {
    const defaultActions = [
      {
        nom: 'Appeler',
        description: 'Passer un appel téléphonique',
        contexte_defaut: 'Téléphone',
        priorite_defaut: 'normal' as const,
        echeance_defaut: null
      },
      {
        nom: 'Envoyer email',
        description: 'Envoyer un courrier électronique',
        contexte_defaut: 'Email',
        priorite_defaut: 'normal' as const,
        echeance_defaut: null
      },
      {
        nom: 'Planifier RDV',
        description: 'Planifier un rendez-vous',
        contexte_defaut: 'Agenda',
        priorite_defaut: 'normal' as const,
        echeance_defaut: '+1 week'
      },
      {
        nom: 'Réviser',
        description: 'Réviser un document ou contenu',
        contexte_defaut: 'Bureau',
        priorite_defaut: 'normal' as const,
        echeance_defaut: null
      },
      {
        nom: 'Urgence',
        description: 'Action urgente à traiter immédiatement',
        contexte_defaut: 'Prioritaire',
        priorite_defaut: 'urgent' as const,
        echeance_defaut: '+1 day'
      }
    ]

    try {
      const actionIds = await Promise.all(
        defaultActions.map(action =>
          this.createActionCustom({
            ...action,
            user_id: userId
          })
        )
      )

      console.log('✅ Default custom actions created:', actionIds)
      return actionIds
    } catch (error) {
      console.error('❌ Error creating default actions:', error)
      throw error
    }
  }

  /**
   * Get action statistics
   */
  async getActionStats(userId: string): Promise<{
    total: number
    mostUsed: ActionCustom | null
  }> {
    try {
      const actions = await this.getActionsCustom(userId)

      const stats = {
        total: actions.length,
        mostUsed: actions.length > 0 ? actions[0] : null // Simple implementation
      }

      console.log('📊 Custom action stats:', stats)
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
    console.log('🧹 ActionsCustomService cleanup completed')
  }
}

// Singleton instance
export const firebaseActionsCustomService = new FirebaseActionsCustomService()