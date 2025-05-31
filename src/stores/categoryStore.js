import { create } from 'zustand'
import categoriesData from '../data/categories.json'

// Helper to get all child IDs for a parent category
const getChildIds = (parentId) => {
  const parent = categoriesData.categories.find(cat => cat.id === parentId)
  return parent ? parent.children.map(child => child.id) : []
}

// Create the store
const useCategoryStore = create((set) => ({
  // Selected category IDs
  selectedParentIds: new Set(),
  selectedChildIds: new Set(),

  // Toggle a parent category and all its children
  toggleParent: (parentId) => set(state => {
    const newParentIds = new Set(state.selectedParentIds)
    const newChildIds = new Set(state.selectedChildIds)
    const childIds = getChildIds(parentId)

    if (state.selectedParentIds.has(parentId)) {
      // Deselect parent and all children
      newParentIds.delete(parentId)
      childIds.forEach(childId => newChildIds.delete(childId))
    } else {
      // Select parent and all children
      newParentIds.add(parentId)
      childIds.forEach(childId => newChildIds.add(childId))
    }

    return {
      selectedParentIds: newParentIds,
      selectedChildIds: newChildIds
    }
  }),

  // Toggle a child category
  toggleChild: (parentId, childId) => set(state => {
    const newChildIds = new Set(state.selectedChildIds)
    const newParentIds = new Set(state.selectedParentIds)
    const childIds = getChildIds(parentId)

    if (state.selectedChildIds.has(childId)) {
      // Deselect child
      newChildIds.delete(childId)
      // If no children selected, deselect parent
      if (!childIds.some(id => newChildIds.has(id))) {
        newParentIds.delete(parentId)
      }
    } else {
      // Select child
      newChildIds.add(childId)
      // If all children selected, select parent
      if (childIds.every(id => newChildIds.has(id))) {
        newParentIds.add(parentId)
      }
    }

    return {
      selectedParentIds: newParentIds,
      selectedChildIds: newChildIds
    }
  }),

  // Reset all selections
  resetSelections: () => set({
    selectedParentIds: new Set(),
    selectedChildIds: new Set()
  }),

  // Select all categories
  selectAll: () => set(state => {
    const newParentIds = new Set()
    const newChildIds = new Set()

    categoriesData.categories.forEach(category => {
      newParentIds.add(category.id)
      category.children.forEach(child => {
        newChildIds.add(child.id)
      })
    })

    return {
      selectedParentIds: newParentIds,
      selectedChildIds: newChildIds
    }
  })
}))

export default useCategoryStore 