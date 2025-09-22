import { useState, useEffect, useCallback } from 'react'
import { firebaseTaskActionsService } from '../services/firebaseTaskActionsService'
import type { TaskAction } from '../types'

interface UseFirebaseTaskActionsReturn {
  actions: TaskAction[]
  loading: boolean
  error: string | null
  hasPendingWrites: boolean
  createAction: (actionData: Omit<TaskAction, 'id' | 'created_at' | 'updated_at'>) => Promise<string>
  updateAction: (actionId: string, updates: Partial<TaskAction>) => Promise<void>
  deleteAction: (actionId: string) => Promise<void>
  completeAction: (actionId: string) => Promise<void>
  addActionToTask: (taskId: string, actionText: string, contexte?: string, priorite?: 'urgent' | 'normal', echeance?: string) => Promise<string>
  reorderActions: (actionIds: string[]) => Promise<void>
  getNextAction: () => Promise<TaskAction | null>
  refresh: () => void
}

export const useFirebaseTaskActions = (taskId: string): UseFirebaseTaskActionsReturn => {
  const [actions, setActions] = useState<TaskAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPendingWrites, setHasPendingWrites] = useState(false)

  const refresh = useCallback(() => {
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

    return unsubscribe
  }, [taskId])

  useEffect(() => {
    const unsubscribe = refresh()
    return unsubscribe
  }, [refresh])

  const createAction = async (actionData: Omit<TaskAction, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      const actionId = await firebaseTaskActionsService.createTaskAction(actionData)
      setHasPendingWrites(false)
      return actionId
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const updateAction = async (actionId: string, updates: Partial<TaskAction>): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskActionsService.updateTaskAction(actionId, updates)
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
      await firebaseTaskActionsService.deleteTaskAction(actionId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const completeAction = async (actionId: string): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskActionsService.completeTaskAction(actionId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const addActionToTask = async (
    taskId: string,
    actionText: string,
    contexte?: string,
    priorite: 'urgent' | 'normal' = 'normal',
    echeance?: string
  ): Promise<string> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      const actionId = await firebaseTaskActionsService.addActionToTask(taskId, actionText, contexte, priorite, echeance)
      setHasPendingWrites(false)
      return actionId
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const reorderActions = async (actionIds: string[]): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskActionsService.reorderActions(actionIds)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const getNextAction = async (): Promise<TaskAction | null> => {
    try {
      setError(null)
      return await firebaseTaskActionsService.getNextAction(taskId)
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
    completeAction,
    addActionToTask,
    reorderActions,
    getNextAction,
    refresh
  }
}

// Hook for a single task action
interface UseFirebaseTaskActionReturn {
  action: TaskAction | null
  loading: boolean
  error: string | null
  hasPendingWrites: boolean
  updateAction: (updates: Partial<TaskAction>) => Promise<void>
  deleteAction: () => Promise<void>
  completeAction: () => Promise<void>
}

export const useFirebaseTaskAction = (actionId: string): UseFirebaseTaskActionReturn => {
  const [action, setAction] = useState<TaskAction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPendingWrites, setHasPendingWrites] = useState(false)

  useEffect(() => {
    if (!actionId) {
      setAction(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = firebaseTaskActionsService.subscribeToTaskAction(actionId, (newAction) => {
      setAction(newAction)
      setLoading(false)
    })

    return unsubscribe
  }, [actionId])

  const updateAction = async (updates: Partial<TaskAction>): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskActionsService.updateTaskAction(actionId, updates)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const deleteAction = async (): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskActionsService.deleteTaskAction(actionId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const completeAction = async (): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskActionsService.completeTaskAction(actionId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  return {
    action,
    loading,
    error,
    hasPendingWrites,
    updateAction,
    deleteAction,
    completeAction
  }
}