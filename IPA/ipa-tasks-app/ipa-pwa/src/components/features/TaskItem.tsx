import { useState } from 'react'
import { CheckIcon, ArrowTopRightOnSquareIcon, ClockIcon, PlayIcon, PencilIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { Task, Category } from '../../types'
import { useTaskActions } from '../../hooks/useTaskActions'

interface TaskItemProps {
  task: Task
  category?: Category
  onMarkComplete: (taskId: string) => void
  onOpenDetails: (taskId: string) => void
  onEdit?: (taskId: string) => void
  loading?: boolean
}

export function TaskItem({ task, category, onMarkComplete, onOpenDetails, onEdit, loading = false }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const { nextAction, completedActions, pendingActions, completeAction } = useTaskActions(task.id)

  const handleMarkComplete = async () => {
    setIsCompleting(true)
    try {
      await onMarkComplete(task.id)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleCompleteNextAction = async () => {
    if (!nextAction) return
    setIsCompleting(true)
    try {
      await completeAction(nextAction.id)
    } catch (err) {
      console.error('Failed to complete action:', err)
    } finally {
      setIsCompleting(false)
    }
  }

  const getPriorityIcon = () => {
    return task.priorite === 'urgent' ? '🔴' : '⚪'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric'
    })
  }

  const firstActionDeadline = task.actions?.find(action => action.statut === 'a_faire')?.echeance
  const isOverdue = firstActionDeadline && new Date(firstActionDeadline) < new Date()
  const isDueToday = firstActionDeadline &&
    new Date(firstActionDeadline).toDateString() === new Date().toDateString()

  const getStatusColor = () => {
    if (task.statut === 'termine') return 'text-gray-500'
    if (isOverdue) return 'text-urgent-600'
    if (isDueToday) return 'text-primary-600'
    return 'text-gray-900'
  }

  const actionsCount = pendingActions.length + completedActions.length
  const completedActionsCount = completedActions.length

  return (
    <div
      className={`task-card cursor-pointer hover:bg-gray-50 transition-colors ${task.statut === 'termine' ? 'opacity-60' : ''}`}
      onClick={() => onOpenDetails(task.id)}
    >
      {/* Mobile layout: Stack vertically */}
      <div className="block sm:hidden">
        {/* Header row with title and main action button */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            <span className="text-base mt-0.5 flex-shrink-0">
              {getPriorityIcon()}
            </span>
            {category && (
              <span
                className="text-base mt-0.5 flex-shrink-0"
                style={{ color: category.couleur }}
              >
                {category.icone}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-sm leading-5 ${getStatusColor()}`}>
                {task.titre}
              </h3>
              {actionsCount > 0 && (
                <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {completedActionsCount}/{actionsCount} actions
                </span>
              )}
            </div>
          </div>

          {/* Primary action button */}
          <div className="flex-shrink-0 ml-2">
            {nextAction && task.statut !== 'termine' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCompleteNextAction()
                }}
                disabled={isCompleting || loading}
                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                title={`Terminer: ${nextAction.action}`}
              >
                <PlayIcon className="h-4 w-4" />
              </button>
            ) : task.statut !== 'termine' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleMarkComplete()
                }}
                disabled={isCompleting || loading}
                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                title="Marquer comme terminée"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Patient info */}
        {task.patient_initiales && (
          <p className="text-xs text-gray-600 mb-2 ml-6">
            {task.patient_initiales}
            {task.patient_numero_anonymise && ` (${task.patient_numero_anonymise})`}
          </p>
        )}

        {/* Next action preview */}
        {nextAction && (
          <div className="ml-6 mb-2">
            <div className="flex items-center space-x-1 mb-1">
              <PlayIcon className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="font-medium text-blue-700 text-xs truncate">
                {nextAction.action}
              </span>
            </div>
            {nextAction.contexte && (
              <p className="text-xs text-gray-500 ml-4 line-clamp-1">
                {nextAction.contexte}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-1 ml-4 mt-1">
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
        )}

        {/* Last completed action */}
        {completedActions.length > 0 && !nextAction && (
          <div className="ml-6 mb-2 flex items-center space-x-1">
            <CheckCircleIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
            <span className="text-xs text-gray-500 line-through truncate">
              {completedActions[completedActions.length - 1]?.action}
            </span>
          </div>
        )}

        {/* Bottom row with deadline and secondary actions */}
        <div className="flex items-center justify-between ml-6">
          {/* Deadline */}
          {firstActionDeadline && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-3 w-3 flex-shrink-0" />
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {formatDate(firstActionDeadline)}
                {isOverdue && ' (Retard)'}
                {isDueToday && ' (Auj.)'}
              </span>
            </div>
          )}

          <div></div>
        </div>
      </div>

      {/* Desktop layout: Original horizontal layout */}
      <div className="hidden sm:flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Priority indicator */}
          <span className="text-lg mt-0.5">
            {getPriorityIcon()}
          </span>

          {/* Category icon */}
          {category && (
            <span
              className="text-lg mt-0.5"
              style={{ color: category.couleur }}
            >
              {category.icone}
            </span>
          )}

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium truncate ${getStatusColor()}`}>
                {task.titre}
              </h3>

              {actionsCount > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {completedActionsCount}/{actionsCount} actions
                </span>
              )}
            </div>

            {/* Patient info */}
            {task.patient_initiales && (
              <p className="text-sm text-gray-600 mb-1">
                {task.patient_initiales}
                {task.patient_numero_anonymise && ` (${task.patient_numero_anonymise})`}
              </p>
            )}

            {/* Next action preview */}
            {nextAction && (
              <div className="text-sm mb-2">
                <div className="flex items-center space-x-1 mb-1">
                  <PlayIcon className="h-3 w-3 text-blue-500" />
                  <span className="font-medium text-blue-700">
                    {nextAction.action}
                  </span>
                  {nextAction.contexte && (
                    <span className="text-gray-500">
                      • {nextAction.contexte}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
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
            )}

            {/* Last completed action */}
            {completedActions.length > 0 && !nextAction && (
              <div className="text-sm text-gray-500 mb-2 flex items-center space-x-1">
                <CheckCircleIcon className="h-3 w-3 text-green-500" />
                <span className="line-through">
                  {completedActions[completedActions.length - 1]?.action}
                </span>
              </div>
            )}

            {/* Deadline */}
            {firstActionDeadline && (
              <div className="flex items-center space-x-1 text-sm">
                <ClockIcon className="h-4 w-4" />
                <span className={isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                  {formatDate(firstActionDeadline)}
                  {isOverdue && ' (En retard)'}
                  {isDueToday && ' (Aujourd\'hui)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Complete next action button (if there's a next action) */}
          {nextAction && task.statut !== 'termine' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCompleteNextAction()
              }}
              disabled={isCompleting || loading}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
              title={`Terminer: ${nextAction.action}`}
            >
              <PlayIcon className="h-5 w-5" />
            </button>
          )}

          {/* Complete entire task button */}
          {task.statut !== 'termine' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleMarkComplete()
              }}
              disabled={isCompleting || loading}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
              title="Marquer toute la tâche comme terminée"
            >
              <CheckIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}