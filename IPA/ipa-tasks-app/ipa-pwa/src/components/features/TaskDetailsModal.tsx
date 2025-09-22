import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import type { Task, Category, TaskAction } from '../../types'
import { TaskActionHistory } from './TaskActionHistory'

interface TaskDetailsModalProps {
  task: Task | null
  category?: Category
  isOpen: boolean
  onClose: () => void
  onMarkComplete: (taskId: string) => void
  onActionEdit?: (action: TaskAction) => void
  onEdit?: (taskId: string) => void
}

export function TaskDetailsModal({
  task,
  category,
  isOpen,
  onClose,
  onMarkComplete,
  onActionEdit,
  onEdit
}: TaskDetailsModalProps) {
  if (!task) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = () => {
    return task.priorite === 'urgent' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
  }

  const getStatusColor = () => {
    switch (task.statut) {
      case 'termine':
        return 'text-green-600 bg-green-100'
      case 'en_cours':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStatusLabel = () => {
    switch (task.statut) {
      case 'termine':
        return 'Terminée'
      case 'en_cours':
        return 'En cours'
      default:
        return 'À faire'
    }
  }

  // Get deadline from first pending action
  const firstActionDeadline = task.actions?.find(action => action.statut === 'a_faire')?.echeance
  const isOverdue = firstActionDeadline && new Date(firstActionDeadline) < new Date()
  const isDueToday = firstActionDeadline &&
    new Date(firstActionDeadline).toDateString() === new Date().toDateString()

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fermer</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start space-x-3">
                    {category && (
                      <span
                        className="text-2xl mt-1"
                        style={{ color: category.couleur }}
                      >
                        {category.icone}
                      </span>
                    )}
                    <div className="flex-1">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        {task.titre}
                      </Dialog.Title>
                      <div className="mt-2 flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor()}`}>
                          {task.priorite === 'urgent' ? '🔴 Urgent' : '⚪ Normal'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
                          {task.statut === 'termine' && <CheckCircleIconSolid className="h-3 w-3 mr-1" />}
                          {getStatusLabel()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-gray-900">Détails de la tâche</h4>

                    {task.patient_initiales && (
                      <div className="flex items-center space-x-2 text-sm">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Patient:</span>
                        <span className="font-medium text-gray-900">
                          {task.patient_initiales}
                          {task.patient_numero_anonymise && ` (${task.patient_numero_anonymise})`}
                        </span>
                      </div>
                    )}

                    {category && (
                      <div className="flex items-center space-x-2 text-sm">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Catégorie:</span>
                        <span
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${category.couleur}20`,
                            color: category.couleur
                          }}
                        >
                          {category.icone} {category.nom}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Échéance:</span>
                      <span className={`font-medium ${
                        isOverdue ? 'text-red-600' : isDueToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {formatDate(firstActionDeadline)}
                        {isOverdue && ' (En retard)'}
                        {isDueToday && ' (Aujourd\'hui)'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Créée le:</span>
                      <span className="text-gray-900">
                        {formatDateTime(task.created_at)}
                      </span>
                    </div>

                    {task.date_completion && (
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Terminée le:</span>
                        <span className="text-gray-900">
                          {formatDateTime(task.date_completion)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action History */}
                  <div>
                    <TaskActionHistory
                      taskId={task.id}
                      onActionComplete={() => {
                        // Optionally refresh task data or show notification
                      }}
                      onActionEdit={onActionEdit}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      {onEdit && (
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => {
                            onEdit(task.id)
                            onClose()
                          }}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Modifier
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={onClose}
                      >
                        Fermer
                      </button>
                      {task.statut !== 'termine' && (
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => {
                            onMarkComplete(task.id)
                            onClose()
                          }}
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Marquer comme terminée
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}