// Main App component for the Historical Timeline project
import Timeline from './components/Timeline'

function App() {
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Header section */}
      <header className="py-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Historical Timeline</h1>
        <p className="text-xl text-gray-400">
          Explore key moments throughout history
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Scroll to navigate • Drag to pan • Use buttons to zoom
        </p>
      </header>

      {/* Main content section with Timeline */}
      <main className="flex justify-center py-8">
        <Timeline />
      </main>
    </div>
  )
}

export default App
