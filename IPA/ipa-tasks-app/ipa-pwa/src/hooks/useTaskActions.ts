import { useState, useEffect, useCallback } from 'react'
import { firebaseTaskActionsService } from '../services/firebaseTaskActionsService'
import type { TaskAction } from '../types'

export function useTaskActions(taskId: string) {
  const [actions, setActions] = useState<TaskAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null)

  const subscribe = useCallback(() => {
    if (!taskId) {
      setActions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = firebaseTaskActionsService.subscribeToTaskActions(taskId, (newActions) => {
      setActions(newActions)
      setLoading(false)
    })

    setUnsubscribeFn(() => unsubscribe)
  }, [taskId])

  const unsubscribe = useCallback(() => {
    setUnsubscribeFn(current => {
      if (current) {
        current()
        return null
      }
      return current
    })
  }, [])

  useEffect(() => {
    subscribe()
    return () => {
      unsubscribe()
    }
  }, [subscribe, unsubscribe])

  const addAction = useCallback(async (
    actionText: string,
    contexte?: string,
    priorite: 'urgent' | 'normal' = 'normal',
    echeance?: string
  ) => {
    try {
      setError(null)
      const actionId = await firebaseTaskActionsService.addActionToTask(taskId, actionText, contexte, priorite, echeance)
      return actionId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add action')
      throw err
    }
  }, [taskId])

  const completeAction = useCallback(async (actionId: string) => {
    try {
      setError(null)
      await firebaseTaskActionsService.completeTaskAction(actionId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete action')
      throw err
    }
  }, [])

  const updateAction = useCallback(async (actionId: string, updates: Partial<TaskAction>) => {
    try {
      setError(null)
      await firebaseTaskActionsService.updateTaskAction(actionId, updates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update action')
      throw err
    }
  }, [])

  const deleteAction = useCallback(async (actionId: string) => {
    try {
      setError(null)
      await firebaseTaskActionsService.deleteTaskAction(actionId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete action')
      throw err
    }
  }, [])

  const getNextAction = useCallback(() => {
    const pendingActions = actions.filter(a => a.statut === 'a_faire')
    if (pendingActions.length === 0) return null
    return pendingActions.sort((a, b) => a.ordre_sequence - b.ordre_sequence)[0]
  }, [actions])

  const getActionHistory = useCallback(() => {
    return actions.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [actions])

  const getCompletedActions = useCallback(() => {
    return actions.filter(a => a.statut === 'fait')
  }, [actions])

  const getPendingActions = useCallback(() => {
    return actions.filter(a => a.statut === 'a_faire')
  }, [actions])

  return {
    // Data
    actions,
    actionHistory: getActionHistory(),
    completedActions: getCompletedActions(),
    pendingActions: getPendingActions(),
    nextAction: getNextAction(),

    // State
    loading,
    error,

    // Actions
    addAction,
    completeAction,
    updateAction,
    deleteAction,
    refreshActions: subscribe
  }
}