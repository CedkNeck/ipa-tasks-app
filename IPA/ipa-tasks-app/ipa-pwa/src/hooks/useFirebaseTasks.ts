import { useState, useEffect, useCallback } from 'react'
import { firebaseTaskService } from '../services/firebaseTaskService'
import { useFirebaseAuth } from './useFirebaseAuth'
import type { Task, ParsedTask } from '../types'

interface UseFirebaseTasksOptions {
  includeCompleted?: boolean
  categoryId?: string
  limit?: number
  autoSubscribe?: boolean
}

interface UseFirebaseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  hasPendingWrites: boolean
  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>, parsedTaskData?: Pick<ParsedTask, 'action' | 'contexte'>) => Promise<string>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  completeTask: (taskId: string) => Promise<void>
  refresh: () => void
  subscribe: () => void
  unsubscribe: () => void
}

export const useFirebaseTasks = (options: UseFirebaseTasksOptions = {}): UseFirebaseTasksReturn => {
  const { user } = useFirebaseAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPendingWrites, setHasPendingWrites] = useState(false)
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null)

  const { autoSubscribe = true, includeCompleted, categoryId, limit } = options

  const subscribe = useCallback(() => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const subscriptionOptions = { includeCompleted, categoryId, limit }
    const unsubscribe = firebaseTaskService.subscribeToTasks(
      user.uid,
      (newTasks) => {
        setTasks(newTasks)
        setLoading(false)
      },
      subscriptionOptions
    )

    setUnsubscribeFn(() => unsubscribe)
  }, [user?.uid, includeCompleted, categoryId, limit])

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

  // Auto-subscribe when user changes or options change
  useEffect(() => {
    if (autoSubscribe) {
      subscribe()
    }

    return () => {
      unsubscribe()
    }
  }, [autoSubscribe, subscribe, unsubscribe])

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>, parsedTaskData?: Pick<ParsedTask, 'action' | 'contexte'>): Promise<string> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      const taskId = await firebaseTaskService.createTask(taskData, parsedTaskData)
      setHasPendingWrites(false)
      return taskId
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskService.updateTask(taskId, updates)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskService.deleteTask(taskId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const completeTask = async (taskId: string): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskService.completeTask(taskId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    hasPendingWrites,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    refresh,
    subscribe,
    unsubscribe
  }
}

// Hook for a single task
interface UseFirebaseTaskReturn {
  task: Task | null
  loading: boolean
  error: string | null
  hasPendingWrites: boolean
  updateTask: (updates: Partial<Task>) => Promise<void>
  deleteTask: () => Promise<void>
  completeTask: () => Promise<void>
}

export const useFirebaseTask = (taskId: string): UseFirebaseTaskReturn => {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPendingWrites, setHasPendingWrites] = useState(false)

  useEffect(() => {
    if (!taskId) {
      setTask(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = firebaseTaskService.subscribeToTask(taskId, (newTask) => {
      setTask(newTask)
      setLoading(false)
    })

    return unsubscribe
  }, [taskId])

  const updateTask = async (updates: Partial<Task>): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskService.updateTask(taskId, updates)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const deleteTask = async (): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskService.deleteTask(taskId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  const completeTask = async (): Promise<void> => {
    try {
      setError(null)
      setHasPendingWrites(true)
      await firebaseTaskService.completeTask(taskId)
      setHasPendingWrites(false)
    } catch (err: any) {
      setError(err.message)
      setHasPendingWrites(false)
      throw err
    }
  }

  return {
    task,
    loading,
    error,
    hasPendingWrites,
    updateTask,
    deleteTask,
    completeTask
  }
}