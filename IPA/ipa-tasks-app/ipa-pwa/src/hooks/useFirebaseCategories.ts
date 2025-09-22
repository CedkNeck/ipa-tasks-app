import { useState, useEffect, useCallback } from 'react'
import { firebaseCategoriesService } from '../services/firebaseCategoriesService'
import { useFirebaseAuth } from './useFirebaseAuth'
import type { Category } from '../types'

interface UseFirebaseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  hasPendingWrites: boolean
  createCategory: (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<string>
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (categoryId: string) => Promise<void>
  getCategoryStats: () => Promise<Array<{ categoryId: string; categoryName: string; taskCount: number }>>
  refresh: () => void
  subscribe: () => void
  unsubscribe: () => void
}

export const useFirebaseCategories = (autoSubscribe: boolean = true): UseFirebaseCategoriesReturn => {
  const { user } = useFirebaseAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPendingWrites, setHasPendingWrites] = useState(false)
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null)

  const subscribe = useCallback(() => {
    if (!user) {
      setCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = firebaseCategoriesService.subscribeToCategories(user.uid, (newCategories) => {
      setCategories(newCategories)
      setLoading(false)
    })

    setUnsubscribeFn(() => unsubscribe)
  }, [user?.uid])

  const unsubscribe = useCallback(() => {
    setUnsubscribeFn(current => {
      if (current) {
        current()
        return null
      }
      return current
    })
  }, [])

  const refresh = useCallback(() => {
    unsubscribe()
    subscribe()
  }, [subscribe, unsubscribe])

  // Auto-subscribe when user changes
  useEffect(() => {
    if (autoSubscribe) {
      subscribe()
    }

    return () => {
      unsubscribe()
    }
  }, [autoSubscribe, subscribe, unsubscribe])

  const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      const categoryId = await firebaseCategoriesService.createCategory(categoryData)
      setHasPendingWrites(false)
      return categoryId
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const updateCategory = async (categoryId: string, updates: Partial<Category>): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseCategoriesService.updateCategory(categoryId, updates)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const deleteCategory = async (categoryId: string): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseCategoriesService.deleteCategory(categoryId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const getCategoryStats = async (): Promise<Array<{ categoryId: string; categoryName: string; taskCount: number }>> => {
    try {
      setError(null)
      if (!user) throw new Error('User not authenticated')
      return await firebaseCategoriesService.getCategoryStats(user.uid)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    categories,
    loading,
    error,
    hasPendingWrites,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats,
    refresh,
    subscribe,
    unsubscribe
  }
}