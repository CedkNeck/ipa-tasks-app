import { useState } from 'react'
import {
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import { useTaskActions } from '../../hooks/useTaskActions'
import type { TaskAction } from '../../types'

interface AddActionFormData {
  action: string
  contexte?: string
  priorite: 'urgent' | 'normal'
  echeance?: string
}

interface AddActionFormProps {
  onSubmit: (data: AddActionFormData) => Promise<void>
  onCancel: () => void
}

interface TaskActionHistoryProps {
  taskId: string
  onActionComplete?: () => void
  onActionEdit?: (action: TaskAction) => void
}

export function TaskActionHistory({ taskId, onActionComplete, onActionEdit }: TaskActionHistoryProps) {
  const {
    actions,
    actionHistory,
    completedActions,
    pendingActions,
    nextAction,
    loading,
    error,
    addAction,
    completeAction,
    deleteAction
  } = useTaskActions(taskId)

  const [expanded, setExpanded] = useState(false)
  const [newActionText, setNewActionText] = useState('')
  const [showAddAction, setShowAddAction] = useState(false)

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActionText.trim()) return

    try {
      await addAction(newActionText.trim())
      setNewActionText('')
      setShowAddAction(false)
    } catch (err) {
      console.error('Failed to add action:', err)
    }
  }

  const handleCompleteAction = async (actionId: string) => {
    try {
      await completeAction(actionId)
      onActionComplete?.()
    } catch (err) {
      console.error('Failed to complete action:', err)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-50 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          {expanded ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          )}
          <ClockIcon className="h-5 w-5 text-gray-500" />
          <div>
            <h3 className="font-medium text-gray-900">
              Historique des actions ({actions.length})
            </h3>
            {!expanded && nextAction && (
              <p className="text-sm text-gray-500">
                Prochaine: {nextAction.action}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {pendingActions.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingActions.length} en attente
            </span>
          )}
          {completedActions.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {completedActions.length} terminées
            </span>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-200">
          {/* Quick action for next pending action */}
          {nextAction && (
            <div className="bg-blue-50 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">
                      Prochaine action: {nextAction.action}
                    </p>
                    {nextAction.contexte && (
                      <p className="text-sm text-blue-700">{nextAction.contexte}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      {nextAction.priorite === 'urgent' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          🔴 Urgent
                        </span>
                      )}
                      {nextAction.echeance && (
                        <span className="text-xs text-blue-600">
                          📅 {new Date(nextAction.echeance).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCompleteAction(nextAction.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Marquer terminée
                </button>
              </div>
            </div>
          )}

          {/* Action history */}
          <div className="p-4">
            {actionHistory.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center py-4">
                Aucune action enregistrée pour cette tâche
              </p>
            ) : (
              <div className="space-y-3">
                {actionHistory.map((action) => (
                  <ActionItem
                    key={action.id}
                    action={action}
                    onComplete={() => handleCompleteAction(action.id)}
                    onDelete={() => deleteAction(action.id)}
                    onEdit={(action) => onActionEdit?.(action)}
                  />
                ))}
              </div>
            )}

            {/* Add new action */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {!showAddAction ? (
                <button
                  onClick={() => setShowAddAction(true)}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter une action
                </button>
              ) : (
                <AddActionForm
                  onSubmit={async (actionData) => {
                    try {
                      await addAction(
                        actionData.action,
                        actionData.contexte,
                        actionData.priorite,
                        actionData.echeance
                      )
                      setShowAddAction(false)
                      setNewActionText('')
                    } catch (err) {
                      console.error('Failed to add action:', err)
                    }
                  }}
                  onCancel={() => {
                    setShowAddAction(false)
                    setNewActionText('')
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ActionItemProps {
  action: TaskAction
  onComplete: () => void
  onDelete: () => void
  onEdit: (action: TaskAction) => void
}

function ActionItem({ action, onComplete, onDelete, onEdit }: ActionItemProps) {
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex items-start space-x-3 group">
      <div className="flex-shrink-0 mt-1">
        {action.statut === 'fait' ? (
          <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
        ) : (
          <button
            onClick={onComplete}
            className="h-5 w-5 border-2 border-gray-300 rounded-full hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <span className="sr-only">Marquer comme terminée</span>
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              action.statut === 'fait'
                ? 'text-gray-500 line-through'
                : 'text-gray-900'
            }`}>
              {action.action}
            </p>
            {action.contexte && (
              <p className={`text-sm mt-1 ${
                action.statut === 'fait'
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}>
                {action.contexte}
              </p>
            )}
            <div className="flex items-center mt-1 space-x-2 flex-wrap">
              {action.priorite === 'urgent' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                  🔴 Urgent
                </span>
              )}
              {action.echeance && (
                <span className="text-xs text-blue-600">
                  📅 {new Date(action.echeance).toLocaleDateString('fr-FR')}
                </span>
              )}
              <p className="text-xs text-gray-500">
                Créée {formatDate(action.created_at)}
              </p>
              {action.date_completion && (
                <span className="text-xs text-green-600">
                  • Terminée {formatDate(action.date_completion)}
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  {action.statut === 'a_faire' && (
                    <button
                      onClick={() => {
                        onComplete()
                        setShowMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Marquer terminée
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onEdit(action)
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      onDelete()
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AddActionForm({ onSubmit, onCancel }: AddActionFormProps) {
  const [formData, setFormData] = useState<AddActionFormData>({
    action: '',
    contexte: '',
    priorite: 'normal',
    echeance: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.action.trim()) return

    await onSubmit({
      ...formData,
      action: formData.action.trim(),
      contexte: formData.contexte?.trim() || undefined,
      echeance: formData.echeance || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Action */}
        <div>
          <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
            Action *
          </label>
          <input
            type="text"
            id="action"
            value={formData.action}
            onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
            placeholder="APPELER, PROGRAMMER, CONTROLER..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            autoFocus
            required
          />
        </div>

        {/* Priorité */}
        <div>
          <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 mb-1">
            Priorité
          </label>
          <select
            id="priorite"
            value={formData.priorite}
            onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value as 'urgent' | 'normal' }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="normal">⚪ Normal</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>

        {/* Contexte */}
        <div>
          <label htmlFor="contexte" className="block text-sm font-medium text-gray-700 mb-1">
            Contexte
          </label>
          <input
            type="text"
            id="contexte"
            value={formData.contexte}
            onChange={(e) => setFormData(prev => ({ ...prev, contexte: e.target.value }))}
            placeholder="Résultats ECBU, consultation onco..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* Échéance */}
        <div>
          <label htmlFor="echeance" className="block text-sm font-medium text-gray-700 mb-1">
            Échéance
          </label>
          <input
            type="date"
            id="echeance"
            value={formData.echeance}
            onChange={(e) => setFormData(prev => ({ ...prev, echeance: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!formData.action.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter l'action
        </button>
      </div>
    </form>
  )
}