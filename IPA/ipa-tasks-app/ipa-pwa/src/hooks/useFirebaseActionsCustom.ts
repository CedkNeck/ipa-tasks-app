import { useState, useEffect, useCallback } from 'react'
import { firebaseActionsCustomService } from '../services/firebaseActionsCustomService'
import { useFirebaseAuth } from './useFirebaseAuth'
import type { ActionCustom } from '../types'

interface UseFirebaseActionsCustomReturn {
  actions: ActionCustom[]
  loading: boolean
  error: string | null
  hasPendingWrites: boolean
  createAction: (actionData: Omit<ActionCustom, 'id' | 'created_at' | 'updated_at'>) => Promise<string>
  updateAction: (actionId: string, updates: Partial<ActionCustom>) => Promise<void>
  deleteAction: (actionId: string) => Promise<void>
  searchActions: (searchTerm: string) => Promise<ActionCustom[]>
  getPopularActions: (limit?: number) => Promise<ActionCustom[]>
  getActionStats: () => Promise<{ total: number; mostUsed: ActionCustom | null }>
  refresh: () => void
  subscribe: () => void
  unsubscribe: () => void
}

export const useFirebaseActionsCustom = (autoSubscribe: boolean = true): UseFirebaseActionsCustomReturn => {
  const { user } = useFirebaseAuth()
  const [actions, setActions] = useState<ActionCustom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPendingWrites, setHasPendingWrites] = useState(false)
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null)

  const subscribe = useCallback(() => {
    if (!user) {
      setActions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = firebaseActionsCustomService.subscribeToActionsCustom(user.uid, (newActions) => {
      setActions(newActions)
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

  const createAction = async (actionData: Omit<ActionCustom, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      const actionId = await firebaseActionsCustomService.createActionCustom(actionData)
      setHasPendingWrites(false)
      return actionId
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const updateAction = async (actionId: string, updates: Partial<ActionCustom>): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseActionsCustomService.updateActionCustom(actionId, updates)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const deleteAction = async (actionId: string): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseActionsCustomService.deleteActionCustom(actionId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const searchActions = async (searchTerm: string): Promise<ActionCustom[]> => {
    try {
      setError(null)
      if (!user) throw new Error('User not authenticated')
      return await firebaseActionsCustomService.searchActions(user.uid, searchTerm)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getPopularActions = async (limit: number = 10): Promise<ActionCustom[]> => {
    try {
      setError(null)
      if (!user) throw new Error('User not authenticated')
      return await firebaseActionsCustomService.getPopularActions(user.uid, limit)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getActionStats = async (): Promise<{ total: number; mostUsed: ActionCustom | null }> => {
    try {
      setError(null)
      if (!user) throw new Error('User not authenticated')
      return await firebaseActionsCustomService.getActionStats(user.uid)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    actions,
    loading,
    error,
    hasPendingWrites,
    createAction,
    updateAction,
    deleteAction,
    searchActions,
    getPopularActions,
    getActionStats,
    refresh,
    subscribe,
    unsubscribe
  }
}