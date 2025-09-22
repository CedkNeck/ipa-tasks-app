import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import type { Category, FilterState } from '../../types'

interface TaskCounts {
  total: number
  pending: number
  urgent: number
  overdue: number
}

interface FilterBarProps {
  categories: Category[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  taskCounts: TaskCounts
}

export function FilterBar({ categories, filters, onFiltersChange, taskCounts }: FilterBarProps) {
  const toggleCategory = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter(c => c !== categoryName)
      : [...filters.categories, categoryName]
    
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const toggleStatus = (status: string) => {
    const newStatuts = filters.statuts.includes(status)
      ? filters.statuts.filter(s => s !== status)
      : [...filters.statuts, status]
    
    onFiltersChange({ ...filters, statuts: newStatuts })
  }

  const togglePriority = (priority: string) => {
    const newPriorites = filters.priorites.includes(priority)
      ? filters.priorites.filter(p => p !== priority)
      : [...filters.priorites, priority]
    
    onFiltersChange({ ...filters, priorites: newPriorites })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      statuts: [],
      priorites: [],
      search: ''
    })
  }

  const hasActiveFilters = filters.categories.length > 0 || 
                          filters.statuts.length > 0 || 
                          filters.priorites.length > 0 || 
                          filters.search.length > 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Quick stats - Mobile: Compact, Desktop: Full */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-gray-600">
            <span className="font-medium">{taskCounts.pending}</span> en cours
          </span>
          {taskCounts.urgent > 0 && (
            <span className="text-red-600">
              <span className="font-medium">{taskCounts.urgent}</span> urgent{taskCounts.urgent > 1 ? 's' : ''}
            </span>
          )}
          {taskCounts.overdue > 0 && (
            <span className="text-red-600">
              <span className="font-medium">{taskCounts.overdue}</span> en retard
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm self-start sm:self-auto"
          >
            Effacer filtres
          </button>
        )}
      </div>

      {/* Filters - Mobile optimized spacing */}
      <div className="space-y-2 sm:space-y-3">
        {/* Status filters */}
        <div>
          <div className="flex items-center space-x-2 mb-1.5 sm:mb-2">
            <FunnelIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Statut</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { key: 'a_faire', label: 'À faire', mobileLabel: 'À faire', color: 'bg-blue-100 text-blue-700' },
              { key: 'en_cours', label: 'En cours', mobileLabel: 'En cours', color: 'bg-orange-100 text-orange-700' },
              { key: 'termine', label: 'Terminé', mobileLabel: 'Terminé', color: 'bg-green-100 text-green-700' }
            ].map(status => (
              <button
                key={status.key}
                onClick={() => toggleStatus(status.key)}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                  filters.statuts.includes(status.key)
                    ? status.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="sm:hidden">{status.mobileLabel}</span>
                <span className="hidden sm:inline">{status.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority filters */}
        <div>
          <span className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Priorité</span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { key: 'urgent', label: '🔴 Urgent', color: 'bg-red-100 text-red-700' },
              { key: 'normal', label: '⚪ Normal', color: 'bg-gray-100 text-gray-700' }
            ].map(priority => (
              <button
                key={priority.key}
                onClick={() => togglePriority(priority.key)}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                  filters.priorites.includes(priority.key)
                    ? priority.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filters - Only show if there are categories */}
        {categories.length > 0 && (
          <div>
            <span className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Catégories</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.nom)}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                    filters.categories.includes(category.nom)
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={filters.categories.includes(category.nom) ? {
                    backgroundColor: category.couleur,
                    color: 'white'
                  } : {}}
                >
                  <span className="sm:hidden">{category.icone}</span>
                  <span className="hidden sm:inline">{category.icone} {category.nom}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}