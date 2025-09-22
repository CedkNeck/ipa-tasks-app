import { useMemo } from 'react'
import { TaskItem } from './TaskItem'
import { FilterBar } from './FilterBar'
import type { Task, Category, FilterState } from '../../types'

interface TaskListProps {
  tasks: Task[]
  categories: Category[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onMarkComplete: (taskId: string) => void
  onOpenDetails: (taskId: string) => void
  onEdit?: (taskId: string) => void
  loading?: boolean
}

export function TaskList({
  tasks,
  categories,
  filters,
  onFiltersChange,
  onMarkComplete,
  onOpenDetails,
  onEdit,
  loading = false
}: TaskListProps) {
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filter by categories
      if (filters.categories.length > 0) {
        const category = categories.find(c => c.id === task.categorie_id)
        if (!category || !filters.categories.includes(category.nom)) {
          return false
        }
      }

      // Filter by status
      if (filters.statuts.length > 0 && !filters.statuts.includes(task.statut)) {
        return false
      }

      // Filter by priority
      if (filters.priorites.length > 0 && !filters.priorites.includes(task.priorite)) {
        return false
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchableText = [
          task.titre,
          task.patient_initiales,
          task.patient_numero_anonymise,
          ...(task.actions?.map(a => `${a.action} ${a.contexte}`) || [])
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchLower)) {
          return false
        }
      }

      return true
    })
  }, [tasks, categories, filters])

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // First sort by completion status (incomplete first)
      if (a.statut === 'termine' && b.statut !== 'termine') return 1
      if (a.statut !== 'termine' && b.statut === 'termine') return -1

      // Then by priority (urgent first)
      if (a.priorite === 'urgent' && b.priorite === 'normal') return -1
      if (a.priorite === 'normal' && b.priorite === 'urgent') return 1

      // Then by deadline of first action (soonest first)
      const aFirstActionDeadline = a.actions?.find(action => action.statut === 'a_faire')?.echeance
      const bFirstActionDeadline = b.actions?.find(action => action.statut === 'a_faire')?.echeance

      if (aFirstActionDeadline && bFirstActionDeadline) {
        return new Date(aFirstActionDeadline).getTime() - new Date(bFirstActionDeadline).getTime()
      }
      if (aFirstActionDeadline && !bFirstActionDeadline) return -1
      if (!aFirstActionDeadline && bFirstActionDeadline) return 1

      // Finally by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [filteredTasks])

  const getTaskCategory = (task: Task) => {
    return categories.find(c => c.id === task.categorie_id)
  }

  const getTaskCounts = () => {
    const total = tasks.length
    const pending = tasks.filter(t => t.statut !== 'termine').length
    const urgent = tasks.filter(t => t.priorite === 'urgent' && t.statut !== 'termine').length
    const overdue = tasks.filter(t => {
      if (t.statut === 'termine') return false
      const firstActionDeadline = t.actions?.find(action => action.statut === 'a_faire')?.echeance
      return firstActionDeadline && new Date(firstActionDeadline) < new Date()
    }).length

    return { total, pending, urgent, overdue }
  }

  const counts = getTaskCounts()

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-4">
        <FilterBar 
          categories={categories}
          filters={filters}
          onFiltersChange={onFiltersChange}
          taskCounts={counts}
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <FilterBar
        categories={categories}
        filters={filters}
        onFiltersChange={onFiltersChange}
        taskCounts={counts}
      />

      {sortedTasks.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 text-2xl sm:text-3xl mb-3 sm:mb-4">📋</div>
          {tasks.length === 0 ? (
            <div className="space-y-2">
              <p className="text-gray-600 font-medium text-sm sm:text-base">Aucune tâche pour le moment</p>
              <p className="text-gray-400 text-xs sm:text-sm">Créez votre première tâche ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600 font-medium text-sm sm:text-base">Aucune tâche trouvée</p>
              <p className="text-gray-400 text-xs sm:text-sm">Modifiez les filtres pour voir plus de tâches</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {/* Task count summary for mobile */}
          <div className="block sm:hidden bg-blue-50 rounded-lg p-3 border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''}
                {filteredTasks.length !== tasks.length && ` sur ${tasks.length}`}
              </span>
              {counts.urgent > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  🔴 {counts.urgent} urgent{counts.urgent > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {sortedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              category={getTaskCategory(task)}
              onMarkComplete={onMarkComplete}
              onOpenDetails={onOpenDetails}
              onEdit={onEdit}
              loading={loading}
            />
          ))}
        </div>
      )}

      {sortedTasks.length > 0 && (
        <div className="hidden sm:block text-center text-sm text-gray-500 py-4">
          {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''} affichée{filteredTasks.length > 1 ? 's' : ''}
          {filteredTasks.length !== tasks.length && ` sur ${tasks.length}`}
          {counts.urgent > 0 && (
            <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              🔴 {counts.urgent} urgent{counts.urgent > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}