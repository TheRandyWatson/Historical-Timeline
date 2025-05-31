import { useState } from 'react'
import categoriesData from '../data/categories.json'
import useCategoryStore from '../stores/categoryStore'
import { PARENT_CATEGORY_COLORS } from '../constants/categoryColors'

// Individual category item component
function CategoryItem({ category }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { selectedParentIds, selectedChildIds, toggleParent, toggleChild } = useCategoryStore()

  return (
    <div className={`mb-4 rounded-lg border-2 ${PARENT_CATEGORY_COLORS[category.id]} bg-gray-900`}>
      {/* Parent category header */}
      <div className="p-3 flex items-center gap-3">
        {/* Expand/collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-700 transition-colors"
        >
          <span className="transform transition-transform">
            {isExpanded ? '▼' : '▶'}
          </span>
        </button>

        {/* Parent checkbox */}
        <label className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            checked={selectedParentIds.has(category.id)}
            onChange={() => toggleParent(category.id)}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-white font-medium">{category.name}</span>
        </label>
      </div>

      {/* Children categories */}
      {isExpanded && (
        <div className="px-12 pb-3 space-y-2">
          {category.children.map(child => (
            <label key={child.id} className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectedChildIds.has(child.id)}
                onChange={() => toggleChild(category.id, child.id)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-300">{child.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// Main CategoryFilter component
function CategoryFilter() {
  const { selectAll, resetSelections } = useCategoryStore()

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-white font-semibold">Filter by Category</h2>
        <div className="space-x-2">
          <button
            onClick={selectAll}
            className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={resetSelections}
            className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Category tree */}
      <div className="space-y-2">
        {categoriesData.categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
          />
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter 