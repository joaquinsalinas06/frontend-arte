'use client'

import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface AudioData {
  titulo: string
  descripcion: string
  url: string
  tipo: 'ambiente' | 'trafico' | 'comercial'
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
}

export default function AudioPanel({ sector, onPlayAudio, onPauseAudio, isPlaying }: AudioPanelProps) {
  const getAudioIcon = (tipo: string) => {
    switch (tipo) {
      case 'ambiente':
        return '🌆'
      case 'trafico':
        return '🚗'
      case 'comercial':
        return '🏪'
      default:
        return '🎵'
    }
  }

  const getAudioColor = (tipo: string) => {
    switch (tipo) {
      case 'ambiente':
        return 'border-green-500 bg-green-50'
      case 'trafico':
        return 'border-red-500 bg-red-50'
      case 'comercial':
        return 'border-orange-500 bg-orange-50'
      default:
        return 'border-blue-500 bg-blue-50'
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

      <div className="space-y-4">
        {sector.audios.map((audio, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-4 ${getAudioColor(audio.tipo)} hover:shadow-md transition-shadow`}
          >
            {/* Header del audio */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getAudioIcon(audio.tipo)}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{audio.titulo}</h3>
                  <span className="text-xs text-gray-500 uppercase font-medium">
                    {audio.tipo}
                  </span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <p className="text-sm text-gray-600 mb-4 italic">
              {audio.descripcion}
            </p>

            {/* Controles de audio */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => onPlayAudio(audio.url)}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={isPlaying}
              >
                <Play className="w-4 h-4" />
                <span>Reproducir</span>
              </button>

              {isPlaying && (
                <button
                  onClick={onPauseAudio}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pausar</span>
                </button>
              )}
            </div>

            {/* Simulación de waveform */}
            <div className="mt-3 flex items-center space-x-1">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-gray-300 rounded-full ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                  style={{
                    height: `${Math.random() * 16 + 4}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          💡 Información
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Los audios se reproducen automáticamente</li>
          <li>• Cada sector tiene diferentes tipos de sonidos</li>
          <li>• Los datos se actualizan en tiempo real</li>
        </ul>
      </div>

      {/* Nota sobre archivos de audio */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-700">
          <strong>Nota:</strong> Los archivos de audio deben estar en la carpeta 
          <code className="bg-yellow-100 px-1 rounded">/public/audios/</code> 
          para funcionar correctamente.
        </p>
      </div>
    </div>
  )
}
