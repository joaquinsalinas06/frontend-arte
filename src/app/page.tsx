'use client'

import dynamic from 'next/dynamic'

// Importamos el componente del mapa dinámicamente para evitar errores de SSR
const AcousticMap = dynamic(() => import('@/app/components/AcousticMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Optimizado para móviles */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
            🎵 Sistema de Monitoreo Acústico
          </h1>
          <p className="text-center mt-1 sm:mt-2 text-xs sm:text-sm text-blue-100">
            Distrito de Barranco - Lima, Perú
          </p>
        </div>
      </header>

      {/* Main Content - Optimizado para móviles */}
      <main className="container mx-auto px-1 sm:px-2 md:px-4 py-2 sm:py-4">
        <AcousticMap />
      </main>
    </div>
  );
}
