import { useState } from 'react'
import { Fragment } from 'react'
import { Dialog, Transition, Menu } from '@headlessui/react'
import {
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowPathIcon,
  WifiIcon,
  CloudIcon,
  Bars3Icon,
  XMarkIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { useFirebaseAuth } from './hooks/useFirebaseAuth'
import { useFirebaseTasks } from './hooks/useFirebaseTasks'
import { useFirebaseCategories } from './hooks/useFirebaseCategories'
import { useFirebaseActionsCustom } from './hooks/useFirebaseActionsCustom'
import { firebaseTaskActionsService } from './services/firebaseTaskActionsService'
import { AuthForm } from './components/features/AuthForm'
import { TaskInput } from './components/features/TaskInput'
import { TaskList } from './components/features/TaskList'
import { TaskDetailsModal } from './components/features/TaskDetailsModal'
import { TaskEditModal } from './components/features/TaskEditModal'
import { ActionEditModal } from './components/features/ActionEditModal'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { ErrorMessage } from './components/ui/ErrorMessage'
import type { FilterState, Task, TaskAction, ParsedTask } from './types'

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useFirebaseAuth()

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    statuts: [],
    priorites: [],
    search: ''
  })

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    hasPendingWrites: tasksPending,
    createTask,
    updateTask,
    completeTask: markTaskComplete,
    refresh: refreshTasks
  } = useFirebaseTasks({
    includeCompleted: filters.statuts.includes('termine')
  })
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories
  } = useFirebaseCategories()
  const {
    actions,
    loading: actionsLoading,
    error: actionsError,
    refresh: refreshActions
  } = useFirebaseActionsCustom()

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingAction, setEditingAction] = useState<TaskAction | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />
  }

  const handleCreateTask = async (parsedTask: ParsedTask) => {
    try {
      // Convert ParsedTask to Task format
      const categoryId = parsedTask.categorie_detectee
        ? categories.find(c => c.nom === parsedTask.categorie_detectee)?.id || null
        : null

      const taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user!.uid,
        titre: parsedTask.titre,
        categorie_id: categoryId,
        patient_initiales: parsedTask.patient_initiales,
        patient_numero_anonymise: parsedTask.patient_numero_anonymise,
        priorite: parsedTask.priorite,
        statut: 'a_faire',
        is_recurrente: false,
        date_completion: undefined,
        deleted_at: undefined
      }

      await createTask(taskData, {
        action: parsedTask.action,
        contexte: parsedTask.contexte,
        echeance: parsedTask.echeance
      })
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleMarkComplete = async (taskId: string) => {
    try {
      await markTaskComplete(taskId)
    } catch (error) {
      console.error('Failed to mark task complete:', error)
    }
  }

  const handleTaskEdit = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleActionEdit = async (actionId: string, updates: Partial<TaskAction>) => {
    try {
      await firebaseTaskActionsService.updateTaskAction(actionId, updates)
      console.log('✅ Action updated successfully:', actionId)
    } catch (error) {
      console.error('Failed to update action:', error)
    }
  }

  const handleOpenDetails = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  const handleCloseDetails = () => {
    setSelectedTaskId(null)
  }

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null
  const selectedTaskCategory = selectedTask ? categories.find(c => c.id === selectedTask.categorie_id) : undefined

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  // Combine loading states
  const isLoading = tasksLoading || categoriesLoading || actionsLoading

  // Combine error states
  const hasError = tasksError || categoriesError || actionsError

  // Create sync status for Firebase (simplified since Firebase handles sync automatically)
  const syncStatus = {
    isOnline: navigator.onLine,
    isSyncing: tasksPending,
    lastSync: new Date() // Firebase doesn't expose last sync time directly
  }

  // Refresh function for all data
  const refreshData = () => {
    refreshTasks()
    refreshCategories()
    refreshActions()
  }

  // Manual sync function (for Firebase this just refreshes data)
  const manualSync = () => {
    refreshData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏥</span>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">IPA Tasks</h1>
                <p className="text-xs text-gray-500">Gestion Oncologie</p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-base font-semibold text-gray-900">IPA Tasks</h1>
              </div>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Sync status indicator */}
              <div className="flex items-center space-x-2">
                {syncStatus.isOnline ? (
                  <WifiIcon className="h-4 w-4 text-green-500" title="En ligne" />
                ) : (
                  <WifiIcon className="h-4 w-4 text-red-500" title="Hors ligne" />
                )}

                <button
                  onClick={manualSync}
                  disabled={syncStatus.isSyncing || !syncStatus.isOnline}
                  className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-colors duration-200"
                  title={syncStatus.isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                >
                  <ArrowPathIcon className={`h-4 w-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                </button>

                {syncStatus.lastSync && (
                  <span className="text-xs text-gray-500 hidden lg:block">
                    {syncStatus.lastSync.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>

              <button
                onClick={() => console.log('Open settings')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Paramètres"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>

              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Se déconnecter"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
              </button>

              <div className="text-sm text-gray-600 hidden lg:block">
                {user.email}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex w-full justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <div className={`${active ? 'bg-gray-50' : ''} px-4 py-2 text-sm text-gray-700`}>
                            <div className="flex items-center space-x-2">
                              {syncStatus.isOnline ? (
                                <WifiIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <WifiIcon className="h-4 w-4 text-red-500" />
                              )}
                              <span>{syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}</span>
                            </div>
                          </div>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={manualSync}
                            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } group flex w-full items-center px-4 py-2 text-sm text-gray-700 disabled:opacity-50`}
                          >
                            <ArrowPathIcon className={`mr-3 h-4 w-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                            {syncStatus.isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                          </button>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => console.log('Open settings')}
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <Cog6ToothIcon className="mr-3 h-4 w-4" />
                            Paramètres
                          </button>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <div className={`${active ? 'bg-gray-50' : ''} px-4 py-2 text-xs text-gray-500 border-t`}>
                            {user.email}
                          </div>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleSignOut}
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } group flex w-full items-center px-4 py-2 text-sm text-red-600`}
                          >
                            <ArrowRightStartOnRectangleIcon className="mr-3 h-4 w-4" />
                            Se déconnecter
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {hasError && (
            <ErrorMessage
              title="Erreur de chargement"
              message={hasError}
              action={{
                label: 'Réessayer',
                onClick: () => {
                  refreshData()
                }
              }}
            />
          )}

          {/* Task Input */}
          <TaskInput
            categories={categories}
            actions={actions}
            onSubmit={handleCreateTask}
            loading={isLoading}
          />

          {/* Task List */}
          <TaskList
            tasks={tasks}
            categories={categories}
            filters={filters}
            onFiltersChange={setFilters}
            onMarkComplete={handleMarkComplete}
            onOpenDetails={handleOpenDetails}
            onEdit={setEditingTaskId}
            loading={isLoading}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
            <p className="text-center sm:text-left">
              © 2024 IPA Tasks
              <span className="hidden sm:inline"> - Mode {syncStatus.isOnline ? 'en ligne' : 'hors ligne'}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-end space-x-3 sm:space-x-4">
              <span className="flex items-center space-x-1">
                {syncStatus.isOnline ? (
                  <WifiIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                ) : (
                  <WifiIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                )}
                <span className="sm:hidden">{syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}</span>
              </span>
              <span>
                {tasks.length} tâche{tasks.length > 1 ? 's' : ''}
              </span>
              {syncStatus.isSyncing && (
                <span className="flex items-center space-x-1">
                  <CloudIcon className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
                  <span className="hidden sm:inline">Synchronisation...</span>
                  <span className="sm:hidden">Sync...</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        category={selectedTaskCategory}
        isOpen={selectedTaskId !== null}
        onClose={handleCloseDetails}
        onMarkComplete={handleMarkComplete}
        onActionEdit={setEditingAction}
        onEdit={setEditingTaskId}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTaskId ? tasks.find(t => t.id === editingTaskId) || null : null}
        categories={categories}
        isOpen={editingTaskId !== null}
        onClose={() => setEditingTaskId(null)}
        onSave={handleTaskEdit}
        loading={isLoading}
      />

      {/* Action Edit Modal */}
      <ActionEditModal
        action={editingAction}
        isOpen={editingAction !== null}
        onClose={() => setEditingAction(null)}
        onSave={handleActionEdit}
        loading={isLoading}
      />
    </div>
  )
}

export default App
