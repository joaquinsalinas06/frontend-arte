'use client'

import dynamic from 'next/dynamic'
import Header from '@/app/components/Header'
import LoadingScreen from '@/app/components/LoadingScreen'

// Importamos el componente del mapa dinámicamente para evitar errores de SSR
const AcousticMap = dynamic(() => import('@/app/components/AcousticMap'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showCreditsButton={true} />

      <main className="container mx-auto px-1 sm:px-2 md:px-4 py-2 sm:py-4">
        <AcousticMap />
      </main>
    </div>
  );
}
