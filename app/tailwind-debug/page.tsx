export default function TailwindDebugPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Tailwind CSS Debug Test</h1>
      
      {/* Basic Colors Test */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-500 text-white p-4 rounded">Red Background</div>
        <div className="bg-green-500 text-white p-4 rounded">Green Background</div>
        <div className="bg-blue-500 text-white p-4 rounded">Blue Background</div>
      </div>

      {/* Layout Test */}
      <div className="flex justify-center items-center mb-8">
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <p className="text-gray-800">Flexbox Center Test</p>
        </div>
      </div>

      {/* Spacing Test */}
      <div className="space-y-4">
        <div className="bg-purple-100 p-2">Padding 2</div>
        <div className="bg-purple-200 p-4">Padding 4</div>
        <div className="bg-purple-300 p-6">Padding 6</div>
      </div>

      {/* Responsive Test */}
      <div className="mt-8 hidden sm:block">
        <p className="text-green-600 font-semibold">✅ This text should only show on small screens and up (hidden on mobile)</p>
      </div>

      {/* Inline Styles for Comparison */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Inline Styles (Should Always Work)</h2>
        <div style={{ backgroundColor: 'orange', color: 'white', padding: '16px', borderRadius: '8px' }}>
          Orange background with inline styles
        </div>
      </div>
    </div>
  )
}