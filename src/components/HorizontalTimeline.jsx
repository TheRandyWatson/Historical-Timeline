import React, { useMemo } from 'react'
import { scaleTime } from '@visx/scale'
import { AxisBottom } from '@visx/axis'
import { Group } from '@visx/group'
import { Circle, Line } from '@visx/shape'
import { timeFormat } from 'd3-time-format'
import categoriesData from '../data/categories.json'
import { PARENT_CATEGORY_COLORS } from '../constants/categoryColors'

// Constants for layout
const MARGIN = { top: 50, right: 40, bottom: 40, left: 200 }
const LANE_HEIGHT = 100
const LANE_PADDING = 20
const LABEL_WIDTH = 180

function HorizontalTimeline({ events = [], width, height }) {
  // Create a time scale that spans a reasonable range
  const timeScale = useMemo(() => {
    const domain = events.length > 0 
      ? [
          Math.min(...events.map(d => d.date)),
          Math.max(...events.map(d => d.date))
        ]
      : [new Date(1700, 0, 1), new Date(2024, 0, 1)] // Default range if no events
    return scaleTime({
      domain,
      range: [MARGIN.left, width - MARGIN.right],
      nice: true
    })
  }, [events, width])

  // Group events by category
  const eventsByCategory = useMemo(() => {
    const categoryMap = new Map()
    categoriesData.categories.forEach(category => {
      categoryMap.set(category.id, {
        name: category.name,
        events: []
      })
    })

    events.forEach(event => {
      // For this example, we'll just use the first matching parent category
      const parentCategory = categoriesData.categories.find(cat => 
        event.categories.some(eventCat => eventCat.includes(cat.name))
      )
      if (parentCategory) {
        const categoryEvents = categoryMap.get(parentCategory.id)
        categoryEvents.events.push(event)
      }
    })

    return categoryMap
  }, [events])

  // Calculate total height needed
  const totalHeight = Math.max(
    height,
    (categoriesData.categories.length * (LANE_HEIGHT + LANE_PADDING)) + MARGIN.top + MARGIN.bottom
  )

  return (
    <svg
      width={width}
      height={totalHeight}
      style={{ background: 'black' }}
    >
      {/* Time axis */}
      <Group transform={`translate(0, ${MARGIN.top - 10})`}>
        <AxisBottom
          scale={timeScale}
          stroke="white"
          tickStroke="white"
          tickFormat={timeFormat("%Y")}
          numTicks={10}
          top={0}
          tickLabelProps={() => ({
            fill: 'white',
            fontSize: 12,
            textAnchor: 'middle'
          })}
        />
      </Group>

      {/* Category lanes */}
      {categoriesData.categories.map((category, index) => {
        const yPos = MARGIN.top + (index * (LANE_HEIGHT + LANE_PADDING))
        const categoryData = eventsByCategory.get(category.id)
        const borderColorClass = PARENT_CATEGORY_COLORS[category.id] || 'border-gray-500'
        const borderColor = borderColorClass.replace('border-', '')

        return (
          <Group key={category.id} transform={`translate(0, ${yPos})`}>
            {/* Lane background */}
            <rect
              x={MARGIN.left - LABEL_WIDTH}
              y={0}
              width={width - MARGIN.right + LABEL_WIDTH}
              height={LANE_HEIGHT}
              fill="rgba(255, 255, 255, 0.03)"
              stroke={`rgb(${borderColor})`}
              strokeOpacity={0.3}
              rx={4}
            />

            {/* Category label */}
            <text
              x={MARGIN.left - LABEL_WIDTH + 10}
              y={LANE_HEIGHT / 2}
              fill="white"
              dominantBaseline="middle"
              fontSize={14}
            >
              {category.name}
            </text>

            {/* Events in this category */}
            {categoryData.events.map(event => (
              <g key={event.id} transform={`translate(${timeScale(event.date)}, ${LANE_HEIGHT / 2})`}>
                <Circle
                  r={5}
                  fill="white"
                  opacity={0.8}
                  className="hover:opacity-100"
                />
                <text
                  x={8}
                  y={0}
                  fill="white"
                  dominantBaseline="middle"
                  fontSize={12}
                  opacity={0.8}
                >
                  {event.title}
                </text>
              </g>
            ))}
          </Group>
        )
      })}
    </svg>
  )
}

export default HorizontalTimeline 