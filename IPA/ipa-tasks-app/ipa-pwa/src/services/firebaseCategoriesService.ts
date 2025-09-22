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
import type { Category } from '../types'
import type { FirebaseCategory } from '../types/firebase'
import {
  firebaseCategoryToClient,
  clientCategoryToFirebase,
  createFirebaseCategory
} from './firestoreUtils'

export class FirebaseCategoriesService {
  private unsubscribers: Map<string, () => void> = new Map()

  /**
   * Subscribe to real-time updates for user categories
   */
  subscribeToCategories(
    userId: string,
    callback: (categories: Category[]) => void
  ): () => void {
    const categoriesRef = collection(db, 'categories')
    const q = query(
      categoriesRef,
      where('userId', '==', userId),
      where('deletedAt', '==', null),
      orderBy('nom', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const categories = snapshot.docs.map(doc => {
          const data = doc.data() as FirebaseCategory
          return firebaseCategoryToClient({ ...data, id: doc.id })
        })

        const source = snapshot.metadata.hasPendingWrites ? "Local" : "Server"
        console.log(`📱 Categories loaded from: ${source} (${categories.length} categories)`)

        callback(categories)
      },
      (error) => {
        console.error('❌ Error listening to categories:', error)
      }
    )

    return unsubscribe
  }

  /**
   * Get categories (one-time fetch)
   */
  async getCategories(userId: string): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, 'categories')
      const q = query(
        categoriesRef,
        where('userId', '==', userId),
        where('deletedAt', '==', null),
        orderBy('nom', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data() as FirebaseCategory
        return firebaseCategoryToClient({ ...data, id: doc.id })
      })
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      throw error
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }

      const firebaseCategory = createFirebaseCategory({
        ...categoryData,
        user_id: auth.currentUser.uid
      })

      const docRef = await addDoc(collection(db, 'categories'), firebaseCategory)
      console.log(`✅ Category created: ${docRef.id}`)

      return docRef.id
    } catch (error) {
      console.error('❌ Error creating category:', error)
      throw error
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    try {
      const categoryRef = doc(db, 'categories', categoryId)
      const firebaseUpdates = clientCategoryToFirebase(updates)

      await updateDoc(categoryRef, firebaseUpdates)
      console.log(`✅ Category updated: ${categoryId}`)
    } catch (error) {
      console.error(`❌ Error updating category ${categoryId}:`, error)
      throw error
    }
  }

  /**
   * Soft delete a category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const categoryRef = doc(db, 'categories', categoryId)

      await updateDoc(categoryRef, {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log(`🗑️ Category soft deleted: ${categoryId}`)
    } catch (error) {
      console.error(`❌ Error deleting category ${categoryId}:`, error)
      throw error
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(userId: string): Promise<Array<{
    categoryId: string
    categoryName: string
    taskCount: number
  }>> {
    try {
      // First get all categories
      const categories = await this.getCategories(userId)

      // Then get task counts for each category
      const stats = await Promise.all(
        categories.map(async (category) => {
          const tasksRef = collection(db, 'tasks')
          const q = query(
            tasksRef,
            where('userId', '==', userId),
            where('categorieId', '==', category.id),
            where('deletedAt', '==', null)
          )

          const snapshot = await getDocs(q)

          return {
            categoryId: category.id!,
            categoryName: category.nom,
            taskCount: snapshot.size
          }
        })
      )

      console.log('📊 Category stats:', stats)
      return stats
    } catch (error) {
      console.error('❌ Error fetching category stats:', error)
      throw error
    }
  }

  /**
   * Create default categories for new user
   */
  async createDefaultCategories(userId: string): Promise<string[]> {
    const defaultCategories = [
      { nom: 'Personnel', couleur: '#3B82F6', description: 'Tâches personnelles' },
      { nom: 'Travail', couleur: '#10B981', description: 'Tâches professionnelles' },
      { nom: 'Urgent', couleur: '#EF4444', description: 'Tâches urgentes' },
      { nom: 'Projets', couleur: '#8B5CF6', description: 'Tâches de projet' }
    ]

    try {
      const categoryIds = await Promise.all(
        defaultCategories.map(category =>
          this.createCategory({
            ...category,
            user_id: userId
          })
        )
      )

      console.log('✅ Default categories created:', categoryIds)
      return categoryIds
    } catch (error) {
      console.error('❌ Error creating default categories:', error)
      throw error
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe())
    this.unsubscribers.clear()
    console.log('🧹 CategoriesService cleanup completed')
  }
}

// Singleton instance
export const firebaseCategoriesService = new FirebaseCategoriesService()