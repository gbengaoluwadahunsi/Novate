// import '../test.css' // Temporarily commented out to test Tailwind

export default function TestTailwindPage() {
  return (
    <div>
      {/* Tailwind Test */}
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Tailwind CSS Test
          </h1>
          
          <div className="space-y-4">
            <div className="bg-blue-100 border border-blue-300 rounded p-4">
              <p className="text-blue-800 font-medium">✅ This should have a blue background (Tailwind)</p>
            </div>
            
            <div className="bg-green-100 border border-green-300 rounded p-4">
              <p className="text-green-800 font-medium">✅ This should have a green background (Tailwind)</p>
            </div>
            
            <div className="bg-red-100 border border-red-300 rounded p-4">
              <p className="text-red-800 font-medium">✅ This should have a red background (Tailwind)</p>
            </div>
            
            <div className="bg-yellow-100 border border-yellow-300 rounded p-4">
              <p className="text-yellow-800 font-medium">✅ This should have a yellow background (Tailwind)</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              If you can see colored boxes above, Tailwind CSS is working correctly!
            </p>
          </div>
        </div>
      </div>
      
      {/* Regular CSS Test */}
      <div style={{ padding: '20px' }}>
        <h2>Regular CSS Test</h2>
        <div className="test-red">
          This should have a RED background (Regular CSS)
        </div>
        <div className="test-blue">
          This should have a BLUE background (Regular CSS)
        </div>
      </div>
    </div>
  )
} 