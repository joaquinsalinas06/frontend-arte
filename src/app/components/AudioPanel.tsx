'use client'

import { Play, Pause, Volume2, Plus } from 'lucide-react'
import { useState } from 'react'

interface AudioData {
  titulo: string
  descripcion: string
  url: string
  tipo?: string
}

interface SectorData {
  id: number
  name: string
  lat: number
  lon: number
  decibeles: number
  audios: AudioData[]
}

interface AudioPanelProps {
  sector: SectorData | null
  onPlayAudio: (url: string) => void
  onPauseAudio: () => void
  isPlaying: boolean
  currentAudioUrl?: string
  onAddToMix?: (audioUrl: string, audioTitle: string) => void
}

export default function AudioPanel({ 
  sector, 
  onPlayAudio, 
  onPauseAudio, 
  isPlaying, 
  currentAudioUrl,
  onAddToMix 
}: AudioPanelProps) {
  const [showingInfo, setShowingInfo] = useState<string | null>(null)
  const getDecibelColor = (decibeles: number) => {
    if (decibeles >= 75) {
      return 'border-gray-500 bg-gray-50' // >75 - gray (extremo)
    } else if (decibeles >= 70) {
      return 'border-purple-500 bg-purple-50' // 70-75 - purple (peligroso)
    } else if (decibeles >= 65) {
      return 'border-blue-500 bg-blue-50' // 65-70 - blue (excesivo)
    } else if (decibeles >= 60) {
      return 'border-red-500 bg-red-50' // 60-65 - red (muy alto)
    } else if (decibeles >= 55) {
      return 'border-orange-500 bg-orange-50' // 55-60 - orange (alto)
    } else if (decibeles >= 50) {
      return 'border-yellow-600 bg-yellow-50' // 50-55 - dark yellow (moderado)
    } else if (decibeles >= 45) {
      return 'border-yellow-500 bg-yellow-50' // 45-50 - light yellow (tranquilo)
    } else {
      return 'border-green-500 bg-green-50' // <45 - green (silencioso)
    }
  }

  const getDecibelIcon = (decibeles: number) => {
    if (decibeles >= 75) {
      return '⚫' // Extremo
    } else if (decibeles >= 70) {
      return '🟣' // Peligroso
    } else if (decibeles >= 65) {
      return '🔵' // Excesivo
    } else if (decibeles >= 60) {
      return '🔴' // Muy alto
    } else if (decibeles >= 55) {
      return '🟠' // Alto
    } else if (decibeles >= 50) {
      return '🟤' // Moderado
    } else if (decibeles >= 45) {
      return '🟡' // Tranquilo
    } else {
      return '🟢' // Silencioso
    }
  }


  const handleAudioClick = (audioUrl: string) => {
    if (showingInfo === audioUrl) {
      setShowingInfo(null)
      onPauseAudio()
    } else {
      setShowingInfo(audioUrl)
      onPlayAudio(audioUrl)
    }
  }

  if (!sector) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Volume2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Selecciona un sector en el mapa para escuchar sus audios</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          🎵 Audios de la Zona
        </h2>
        <p className="text-sm text-gray-600">
          {sector.name} - {sector.audios.length} audio(s) disponible(s)
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {sector.audios.map((audio, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-3 sm:p-4 ${getDecibelColor(sector.decibeles)} hover:shadow-lg transition-all cursor-pointer relative touch-manipulation`}
            onClick={() => handleAudioClick(audio.url)}
          >
            {/* Header del audio */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{getDecibelIcon(sector.decibeles)}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{audio.titulo}</h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {sector.decibeles} dB
                  </span>
                </div>
              </div>
              
            </div>

            {/* Información expandida cuando se hace click */}
            {showingInfo === audio.url && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-white bg-opacity-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 italic">
                  {audio.descripcion}
                </p>
                
                {/* Controles de audio principales */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                  {isPlaying && currentAudioUrl === audio.url ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onPauseAudio()
                      }}
                      className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm touch-manipulation"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pausar</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onPlayAudio(audio.url)
                      }}
                      className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm touch-manipulation"
                    >
                      <Play className="w-4 h-4" />
                      <span className="hidden sm:inline">Reproducir completo</span>
                      <span className="sm:hidden">Reproducir</span>
                    </button>
                  )}

                </div>


                {/* Waveform animado */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-gray-400 rounded-full ${
                        isPlaying && currentAudioUrl === audio.url ? 'animate-pulse' : ''
                      }`}
                      style={{
                        height: `${Math.random() * 16 + 8}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Mix button and instructions */}
            <div className="mt-2 sm:mt-3 space-y-2">
              {!showingInfo && (
                <div className="text-xs text-gray-500">
                  <span className="sm:hidden">Toca para más opciones</span>
                  <span className="hidden sm:inline">Click para más opciones y controles</span>
                </div>
              )}
              
              {/* Mix button outside the card */}
              {onAddToMix && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddToMix(audio.url, audio.titulo)
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-lg transition-all shadow-md text-sm font-medium touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Añadir a mi mezcla</span>
                  <span className="sm:hidden">Añadir</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          💡 Cómo usar
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Hover en mapa:</strong> Escucha preview de la zona</li>
          <li>• <strong>Click:</strong> Expande para ver controles completos</li>
          <li>• <strong>Colores:</strong> Coinciden con la escala de decibeles</li>
        </ul>
      </div>

    </div>
  )
}
