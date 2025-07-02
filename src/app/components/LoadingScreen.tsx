'use client'

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-slate-600 ml-3">Cargando...</span>
      </div>
    </div>
  )
}