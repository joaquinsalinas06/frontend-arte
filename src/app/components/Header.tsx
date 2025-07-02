'use client'

import Link from 'next/link'
import { Users, ArrowLeft } from 'lucide-react'

interface HeaderProps {
  showCreditsButton?: boolean
  showBackButton?: boolean
}

export default function Header({ showCreditsButton = true, showBackButton = false }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-900 via-purple-800 to-violet-700 text-white shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button or empty space */}
          <div className="flex-1">
            {showBackButton && (
              <Link 
                href="/"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-purple-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <ArrowLeft size={16} />
                Volver
              </Link>
            )}
          </div>
          
          {/* Center - Title and info */}
          <div className="flex-2 text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              Ecos Urbanos: Barranco a través de sus ruidos
            </h1>
            <div className="text-xs sm:text-sm text-slate-300 mt-1">
              <span className="font-medium">Arte y Tecnología - Sección 1.7</span>
              <span className="mx-2">•</span>
              <span>Prof. Violeta Reaño</span>
              <span className="mx-2">•</span>
              <span>UTEC</span>
            </div>
          </div>
          
          {/* Right side - Credits button or empty space */}
          <div className="flex-1 flex justify-end">
            {showCreditsButton && (
              <Link 
                href="/credits"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-purple-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <Users size={16} />
                Créditos
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}