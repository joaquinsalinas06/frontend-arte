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
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">
            🎵 Sistema de Monitoreo Acústico
          </h1>
          <p className="text-center mt-2 text-blue-100">
            Distrito de Barranco - Lima, Perú
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <AcousticMap />
      </main>
    </div>
  );
}
