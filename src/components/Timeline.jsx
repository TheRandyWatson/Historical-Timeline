// Timeline.jsx - Interactive timeline with vertical and horizontal orientations
import { useMemo, useState } from 'react'
import { scaleTime } from '@visx/scale'
import { Group } from '@visx/group'
import { Line, Circle } from '@visx/shape'
import { Zoom } from '@visx/zoom'
import { timeFormat } from 'd3-time-format'
import eventsData from '../data/events.json'
import CategoryFilter from './CategoryFilter'
import HorizontalTimeline from './HorizontalTimeline'
import useCategoryStore from '../stores/categoryStore'

// Formatting functions
const formatDate = timeFormat("%B %d, %Y")
const parseDate = (dateString) => new Date(dateString)

// Constants for layout
const width = 800
const height = 2000
const margin = { top: 40, right: 300, bottom: 40, left: 300 }
const timelineWidth = width - margin.left - margin.right
const centerX = timelineWidth / 2 + margin.left

// Initial zoom transform
const initialTransform = {
  scaleY: 1,
  translateY: 0,
  translateX: 0
}

function Timeline() {
  // State for timeline orientation
  const [orientation, setOrientation] = useState('vertical')
  const { selectedParentIds, selectedChildIds } = useCategoryStore()

  // Filter and sort events based on selected categories
  const filteredEvents = useMemo(() => {
    // If no categories are selected (Clear All), return empty array
    if (selectedParentIds.size === 0) {
      return [];
    }

    // Otherwise, return all events (for now)
    return [...eventsData.events]
      .map(event => ({
        ...event,
        date: new Date(event.date)
      }))
      .sort((a, b) => a.date - b.date);
  }, [selectedParentIds]);

  // Debug information in render
  console.log('Current orientation:', orientation);
  console.log('Rendering with filtered events:', filteredEvents);

  // Create scales
  const timeScale = useMemo(() => {
    if (filteredEvents.length === 0) {
      return scaleTime({
        domain: [new Date(), new Date()],
        range: [height - margin.bottom, margin.top]
      })
    }

    const domain = [
      Math.min(...filteredEvents.map(d => d.date)),
      Math.max(...filteredEvents.map(d => d.date))
    ]
    return scaleTime({
      domain,
      range: [height - margin.bottom, margin.top]
    })
  }, [filteredEvents])

  // Handle wheel events for scrolling
  const handleWheel = (event, zoom) => {
    event.preventDefault()
    
    if (orientation === 'horizontal' && event.metaKey) {
      // Command/Meta + wheel for zooming in horizontal mode
      const direction = event.deltaY > 0 ? 0.9 : 1.1
      zoom.scale({ scaleX: zoom.transformMatrix.scaleX * direction })
    } else if (orientation === 'vertical') {
      // Regular vertical scrolling in vertical mode
      zoom.translateBy({ y: -event.deltaY })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Debug Panel */}
      <div className="bg-gray-800 p-4 mb-4 rounded-lg text-white text-sm">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <div>Total Events: {eventsData.events.length}</div>
        <div>Filtered Events: {filteredEvents.length}</div>
        <div>Selected Categories: {Array.from(selectedParentIds).join(', ') || 'None'}</div>
        <div>Orientation: {orientation}</div>
      </div>

      {/* Header with orientation toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setOrientation(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Switch to {orientation === 'vertical' ? 'Horizontal' : 'Vertical'} View
        </button>
      </div>

      {/* Category filter */}
      <CategoryFilter />

      {/* Timeline container with horizontal scroll for horizontal view */}
      <div className={orientation === 'horizontal' ? 'overflow-x-auto' : ''}>
        {orientation === 'vertical' ? (
          // Vertical Timeline
          <div className="relative mx-auto" style={{ width: `${width}px` }}>
            <Zoom
              width={width}
              height={height}
              scaleXMin={0.5}
              scaleXMax={2}
              scaleYMin={0.5}
              scaleYMax={4}
              wheelEnabled={false}
              initialTransform={initialTransform}
            >
              {(zoom) => (
                <div className="relative">
                  <svg
                    width={width}
                    height={height}
                    style={{
                      cursor: zoom.isDragging ? 'grabbing' : 'grab',
                      touchAction: 'none'
                    }}
                    ref={zoom.containerRef}
                    onWheel={(e) => handleWheel(e, zoom)}
                  >
                    <rect
                      x={0}
                      y={0}
                      width={width}
                      height={height}
                      fill="black"
                      opacity={0}
                      onWheel={(e) => handleWheel(e, zoom)}
                    />
                    <Group transform={zoom.toString()}>
                      {/* Show message when no events match the filter */}
                      {filteredEvents.length === 0 && (
                        <text
                          x={centerX}
                          y={height / 2}
                          textAnchor="middle"
                          className="text-xl text-gray-500"
                          fill="currentColor"
                        >
                          No events match the selected categories
                        </text>
                      )}

                      {/* Only render the timeline if we have events */}
                      {filteredEvents.length > 0 && (
                        <>
                          {/* Vertical timeline line */}
                          <Line
                            from={{ x: centerX, y: margin.top }}
                            to={{ x: centerX, y: height - margin.bottom }}
                            stroke="white"
                            strokeWidth={2}
                          />

                          {/* Events */}
                          {filteredEvents.map((event, i) => {
                            const y = timeScale(event.date)
                            const isLeft = i % 2 === 0

                            return (
                              <g key={event.id}>
                                {/* Horizontal connector */}
                                <Line
                                  from={{ x: centerX, y }}
                                  to={{ x: isLeft ? centerX - 20 : centerX + 20, y }}
                                  stroke="white"
                                  strokeWidth={1}
                                />

                                {/* Timeline dot */}
                                <Circle
                                  cx={centerX}
                                  cy={y}
                                  r={4}
                                  fill="white"
                                />

                                {/* Event card */}
                                <foreignObject
                                  x={isLeft ? margin.left - 280 : centerX + 30}
                                  y={y - 50}
                                  width={250}
                                  height={100}
                                >
                                  <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
                                    <h3 className="text-white font-bold mb-1">{event.title}</h3>
                                    <p className="text-gray-400 text-sm mb-2">
                                      {formatDate(event.date)}
                                    </p>
                                    <p className="text-gray-300 text-sm line-clamp-2">
                                      {event.description}
                                    </p>
                                  </div>
                                </foreignObject>
                              </g>
                            )
                          })}
                        </>
                      )}
                    </Group>
                  </svg>

                  {/* Zoom controls */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={() => zoom.scale({ scaleY: zoom.transformMatrix.scaleY * 1.2 })}
                      className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      +
                    </button>
                    <button
                      onClick={() => zoom.scale({ scaleY: zoom.transformMatrix.scaleY / 1.2 })}
                      className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      -
                    </button>
                  </div>
                </div>
              )}
            </Zoom>
          </div>
        ) : (
          // Horizontal Timeline
          <div className="relative mx-auto overflow-x-auto" style={{ maxWidth: '100%' }}>
            <div style={{ width: `${width * 3}px`, minHeight: `${height}px` }}>
              <HorizontalTimeline
                events={filteredEvents}
                width={width * 3}
                height={height}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Timeline 