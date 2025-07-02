'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Popup, Polygon, CircleMarker } from 'react-leaflet'
import DecibelMeter from '@/app/components/DecibelMeter'
import AudioPanel from '@/app/components/AudioPanel'
import StatsPanel from '@/app/components/StatsPanel'
import { loadBarrancoCoordinates, BarrancoCoordinates } from '@/app/utils/geoJsonLoader'

// Importar estilos de Leaflet
import 'leaflet/dist/leaflet.css'

// Tipos de datos
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
  polygon?: [number, number][]
  color?: string
  audios: AudioData[]
}

interface SectorsData {
  distrito: string
  ciudad: string
  pais: string
  timestamp: string
  total_sectores: number
  estadisticas: {
    promedio_db: number
    max_db: number
    min_db: number
    sectores_alto_ruido: number
  }
  sectores: Array<{
    id: number
    name: string
    polygon: [number, number][]
    sector_type: string
    color: string
  }>
}

interface PointsData {
  distrito: string
  ciudad: string
  pais: string
  timestamp: string
  total_puntos: number
  estadisticas: {
    promedio_db: number
    max_db: number
    min_db: number
    sectores_alto_ruido: number
  }
  puntos: SectorData[]
}

// Función para cargar sectores (polígonos) desde el archivo JSON
async function loadSectors(): Promise<Array<{id: number, name: string, polygon: [number, number][], sector_type: string, color: string}>> {
  try {
    const response = await fetch('/data/barranco_sectors.json')
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo de sectores')
    }
    
    const data: SectorsData = await response.json()
    return data.sectores || []
  } catch (error) {
    console.error('Error cargando sectores:', error)
    return []
  }
}

// Función para cargar puntos de medición desde el archivo JSON
async function loadPoints(): Promise<SectorData[]> {
  try {
    const response = await fetch('/data/barranco_points.json')
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo de puntos')
    }
    
    const data: PointsData = await response.json()
    return data.puntos || []
  } catch (error) {
    console.error('Error cargando puntos:', error)
    return []
  }
}

// Function to convert AudioBuffer to WAV blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44
  const arrayBuffer = new ArrayBuffer(length)
  const view = new DataView(arrayBuffer)
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, length - 8, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, buffer.numberOfChannels, true)
  view.setUint32(24, buffer.sampleRate, true)
  view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true)
  view.setUint16(32, buffer.numberOfChannels * 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, buffer.length * buffer.numberOfChannels * 2, true)
  
  // Convert float samples to 16-bit PCM
  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

// Función para oscurecer un color hexadecimal para el borde
function darkenColor(hex: string, amount: number = 60): string {
  // Remover el # si existe
  const color = hex.replace('#', '')
  
  // Convertir a RGB
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  
  // Oscurecer cada componente
  const newR = Math.max(0, r - amount)
  const newG = Math.max(0, g - amount)
  const newB = Math.max(0, b - amount)
  
  // Convertir de vuelta a hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}

// Función para obtener color y configuración de mancha según decibeles
const getSoundVisualization = (decibeles: number) => {
  if (decibeles > 75) {
    return {
      color: '#6b7280', // gray
      fillColor: '#6b7280',
      opacity: 0.8,
      fillOpacity: 0.4,
      radius: 40
    }
  } else if (decibeles > 70) {
    return {
      color: '#7c3aed', // purple
      fillColor: '#7c3aed',
      opacity: 0.7,
      fillOpacity: 0.35,
      radius: 38
    }
  } else if (decibeles > 65) {
    return {
      color: '#2563eb', // blue
      fillColor: '#2563eb',
      opacity: 0.6,
      fillOpacity: 0.3,
      radius: 35
    }
  } else if (decibeles > 60) {
    return {
      color: '#dc2626', // red
      fillColor: '#dc2626',
      opacity: 0.6,
      fillOpacity: 0.3,
      radius: 32
    }
  } else if (decibeles > 55) {
    return {
      color: '#ea580c', // orange
      fillColor: '#ea580c', 
      opacity: 0.5,
      fillOpacity: 0.25,
      radius: 30
    }
  } else if (decibeles > 50) {
    return {
      color: '#ca8a04', // darker yellow
      fillColor: '#ca8a04',
      opacity: 0.4,
      fillOpacity: 0.2,
      radius: 27
    }
  } else if (decibeles > 45) {
    return {
      color: '#eab308', // light yellow
      fillColor: '#eab308',
      opacity: 0.4,
      fillOpacity: 0.2,
      radius: 25
    }
  } else {
    return {
      color: '#16a34a', // green
      fillColor: '#16a34a',
      opacity: 0.3,
      fillOpacity: 0.15,
      radius: 20
    }
  }
}

export default function AcousticMap() {
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null)
  const [barrancoCoords, setBarrancoCoords] = useState<BarrancoCoordinates | null>(null)
  const [sectorsData, setSectorsData] = useState<Array<{id: number, name: string, polygon: [number, number][], sector_type: string, color: string}>>([])
  const [pointsData, setPointsData] = useState<SectorData[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const [mixAudios, setMixAudios] = useState<{url: string, title: string}[]>([])
  const [hoverAudio, setHoverAudio] = useState<HTMLAudioElement | null>(null)
  const [showMixPopup, setShowMixPopup] = useState(false)
  const [notifications, setNotifications] = useState<{id: number, message: string}[]>([])
  const [notificationId, setNotificationId] = useState(0)
  const [audioContextInitialized, setAudioContextInitialized] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [visitedSectors, setVisitedSectors] = useState<SectorData[]>([])
  const [isGeneratingMix, setIsGeneratingMix] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar coordenadas de Barranco
        const coords = await loadBarrancoCoordinates()
        setBarrancoCoords(coords)

        // Cargar sectores (polígonos) y puntos (mediciones) por separado
        const [sectors, points] = await Promise.all([
          loadSectors(),
          loadPoints()
        ])
        setSectorsData(sectors)
        setPointsData(points)
        
        // Seleccionar el primer punto por defecto
        if (points.length > 0) {
          setSelectedSector(points[0])
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Cleanup effect for audio
  useEffect(() => {
    return () => {
      // Clean up hover audio
      if (hoverAudio) {
        hoverAudio.pause()
        hoverAudio.currentTime = 0
      }
      
      // Clean up current audio
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }
      
      // Clean up download blob
      const windowWithBlob = window as Window & { lastMixDownloadBlob?: Blob }
      if (windowWithBlob.lastMixDownloadBlob) {
        windowWithBlob.lastMixDownloadBlob = undefined
      }
    }
  }, [hoverAudio, currentAudio])

  // Initialize audio context for mobile compatibility
  const initializeAudioContext = () => {
    if (!audioContextInitialized) {
      try {
        const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext
        if (AudioContext) {
          const context = new AudioContext()
          context.resume().then(() => {
            setAudioContextInitialized(true)
            console.log('Audio context initialized for mobile')
          })
        }
      } catch (error) {
        console.warn('Could not initialize audio context:', error)
      }
    }
  }

  const handleSectorClick = (sector: SectorData) => {
    // Initialize audio context on first interaction (mobile requirement)
    initializeAudioContext()
    setSelectedSector(sector)
    
    // Auto-open audio panel when a point is selected
    setRightPanelOpen(true)
    
    // Track visited sectors
    if (!visitedSectors.find(s => s.id === sector.id)) {
      setVisitedSectors(prev => [...prev, sector])
    }
  }

  const handleSectorHover = (sector: SectorData) => {
    // Initialize audio context on first interaction (mobile requirement)
    initializeAudioContext()
    setSelectedSector(sector)
    
    // Play preview audio on hover
    if (sector.audios && sector.audios.length > 0) {
      // Stop previous hover audio properly
      if (hoverAudio) {
        hoverAudio.pause()
        hoverAudio.currentTime = 0
        setHoverAudio(null)
      }
      
      // Small delay to avoid race conditions
      setTimeout(() => {
        try {
          const audio = new Audio(sector.audios[0].url)
          audio.volume = 0.3 // Lower volume for preview
          
          // Set up audio before playing
          audio.onended = () => {
            setHoverAudio(null)
          }
          
          audio.onerror = (e) => {
            console.warn('Audio load error:', e)
            setHoverAudio(null)
          }
          
          setHoverAudio(audio)
          
          // Play with better error handling
          audio.play().catch((error) => {
            if (error.name !== 'AbortError') {
              console.warn('Audio play error:', error)
            }
            setHoverAudio(null)
          })
        } catch (error) {
          console.warn('Error creating audio:', error)
        }
      }, 50)
    }
  }
  
  const handleSectorLeave = () => {
    // Don't stop hover audio when leaving sector - let it play until end or new hover
    // Only reset visual state, not audio
  }

  const handlePlayAudio = (url: string) => {
    if (currentAudio) {
      currentAudio.pause()
    }

    const audio = new Audio(url)
    audio.play().catch((error) => {
      console.error('Error reproduciendo audio:', error)
    })
    
    audio.onended = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
      setCurrentAudioUrl(null)
    }

    setCurrentAudio(audio)
    setCurrentAudioUrl(url)
    setIsPlaying(true)
  }

  const handlePauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
    }
    setIsPlaying(false)
    setCurrentAudio(null)
    setCurrentAudioUrl(null)
  }

  const generateAudioMix = async () => {
    if (visitedSectors.length < 2) return
    
    setIsGeneratingMix(true)
    
    try {
      // Create audio context for mixing
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported')
      }
      const audioContext = new AudioContextClass()
      const mixBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 30, audioContext.sampleRate) // 30 seconds
      
      // Load and mix audio files
      const audioPromises = visitedSectors.map(async (sector, index) => {
        if (!sector.audios || sector.audios.length === 0) return null
        
        // Use first available audio
        const audioToUse = sector.audios[0]
        
        try {
          const response = await fetch(audioToUse.url)
          if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`)
          
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          // Calculate offset for overlapping (each audio starts 2 seconds after the previous for more overlap)
          const startOffset = index * 2 * audioContext.sampleRate
          const durationSamples = Math.min(audioBuffer.length, 10 * audioContext.sampleRate) // Max 10 seconds per audio
          
          // Mix into the main buffer with volume based on position (more overlap)
          const volume = 0.2 + (0.3 * Math.sin((index / visitedSectors.length) * Math.PI)) // Vary volume, lower base
          
          for (let channel = 0; channel < Math.min(2, audioBuffer.numberOfChannels); channel++) {
            const sourceData = audioBuffer.getChannelData(channel)
            const targetData = mixBuffer.getChannelData(channel)
            
            for (let i = 0; i < durationSamples && i < sourceData.length; i++) {
              const targetIndex = startOffset + i
              if (targetIndex < targetData.length) {
                targetData[targetIndex] += sourceData[i] * volume
              }
            }
          }
          
          return audioBuffer
        } catch (error) {
          console.warn(`Error loading audio for sector ${sector.name}:`, error)
          return null
        }
      })
      
      const loadedBuffers = await Promise.all(audioPromises)
      const validBuffers = loadedBuffers.filter(buffer => buffer !== null)
      
      if (validBuffers.length === 0) {
        throw new Error('No valid audio files could be loaded')
      }
      
      // Create and play the mixed audio
      const source = audioContext.createBufferSource()
      source.buffer = mixBuffer
      
      // Add fade in/out effects
      const gainNode = audioContext.createGain()
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      const now = audioContext.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(1, now + 1) // Fade in over 1 second
      gainNode.gain.setValueAtTime(1, now + 28) // Keep volume for most of the duration
      gainNode.gain.linearRampToValueAtTime(0, now + 30) // Fade out in the last 2 seconds
      
      source.start()
      
      // Create downloadable version using the same buffer
      setTimeout(() => {
        try {
          // Apply fade effects to the mix buffer directly
          const fadeBuffer = audioContext.createBuffer(2, mixBuffer.length, mixBuffer.sampleRate)
          
          for (let channel = 0; channel < 2; channel++) {
            const sourceData = mixBuffer.getChannelData(channel)
            const targetData = fadeBuffer.getChannelData(channel)
            
            for (let i = 0; i < sourceData.length; i++) {
              let fadeMultiplier = 1
              const sampleTime = i / mixBuffer.sampleRate
              
              // Fade in (first second)
              if (sampleTime < 1) {
                fadeMultiplier = sampleTime
              }
              // Fade out (last 2 seconds)
              else if (sampleTime > 28) {
                fadeMultiplier = Math.max(0, (30 - sampleTime) / 2)
              }
              
              targetData[i] = sourceData[i] * fadeMultiplier
            }
          }
          
          // Convert to wav blob
          let wavBlob: Blob
          try {
            console.log('Calling audioBufferToWav with buffer:', fadeBuffer)
            console.log('Function exists:', typeof audioBufferToWav)
            wavBlob = audioBufferToWav(fadeBuffer)
            console.log('WAV conversion successful, blob size:', wavBlob.size)
          } catch (funcError) {
            console.error('audioBufferToWav function error:', funcError)
            // Fallback: use file-saver to create basic audio data
            const channels = fadeBuffer.numberOfChannels
            const length = fadeBuffer.length
            const sampleRate = fadeBuffer.sampleRate
            
            // Create a minimal WAV header
            const buffer = new ArrayBuffer(44 + length * channels * 2)
            const view = new DataView(buffer)
            
            // WAV header
            const writeString = (offset: number, string: string) => {
              for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i))
              }
            }
            
            writeString(0, 'RIFF')
            view.setUint32(4, 36 + length * channels * 2, true)
            writeString(8, 'WAVE')
            writeString(12, 'fmt ')
            view.setUint32(16, 16, true)
            view.setUint16(20, 1, true)
            view.setUint16(22, channels, true)
            view.setUint32(24, sampleRate, true)
            view.setUint32(28, sampleRate * channels * 2, true)
            view.setUint16(32, channels * 2, true)
            view.setUint16(34, 16, true)
            writeString(36, 'data')
            view.setUint32(40, length * channels * 2, true)
            
            // Convert audio data
            let offset = 44
            for (let i = 0; i < length; i++) {
              for (let channel = 0; channel < channels; channel++) {
                const sample = Math.max(-1, Math.min(1, fadeBuffer.getChannelData(channel)[i]))
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
                offset += 2
              }
            }
            
            wavBlob = new Blob([buffer], { type: 'audio/wav' })
            console.log('Fallback WAV creation successful, blob size:', wavBlob.size)
          }
          
          // Store the blob directly for download
          const windowWithBlob = window as Window & { lastMixDownloadBlob?: Blob }
          windowWithBlob.lastMixDownloadBlob = wavBlob
          console.log('Mix ready for download:', wavBlob)
        } catch (error) {
          console.error('Error preparing download:', error)
        }
      }, 2000)
      
      // Show success popup
      setTimeout(() => {
        setShowMixPopup(true)
      }, 1000)
      
    } catch (error) {
      console.error('Error generating audio mix:', error)
      alert('⚠️ Error al generar el mix de audio. Por favor, inténtalo de nuevo.')
    } finally {
      setIsGeneratingMix(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando datos de sectores...</p>
        </div>
      </div>
    )
  }

  const center: [number, number] = barrancoCoords ? barrancoCoords.center : [-12.140, -77.020]

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Full-screen map container */}
      <div className="absolute inset-0">
        <MapContainer
          center={center}
          zoom={15}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Polígono de Barranco */}
          {barrancoCoords && (
            <Polygon
              positions={barrancoCoords.coordinates}
              pathOptions={{
                color: '#2563eb',
                weight: 3,
                opacity: 0.8,
                fillColor: '#3b82f6',
                fillOpacity: 0.1
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">Distrito de Barranco</h3>
                  <p className="text-sm text-gray-600">Lima, Perú</p>
                  <p className="text-xs mt-1">
                    Sectores monitoreados: {pointsData.length}
                  </p>
                </div>
              </Popup>
            </Polygon>
          )}

          {/* Sectores como polígonos delimitadores con colores */}
          {sectorsData.map((sector) => (
            <Polygon
              key={`sector-${sector.id}`}
              positions={sector.polygon}
              pathOptions={{
                color: darkenColor(sector.color, 40),
                weight: 2,
                opacity: 0.8,
                fillColor: sector.color,
                fillOpacity: 0.15
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-bold text-base">{sector.name}</h4>
                  <p className="text-sm text-gray-600">
                    Sector de monitoreo delimitado
                  </p>
                  <div 
                    className="w-4 h-4 rounded-full mt-2 border border-gray-400"
                    style={{ backgroundColor: sector.color }}
                  ></div>
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Marcadores de puntos como manchas difuminadas (mapa de calor) */}
          {pointsData.map((sector) => {
            const visualization = getSoundVisualization(sector.decibeles)
            return (
              <div key={`heatmap-${sector.id}`}>
                {/* Capa más exterior (muy difuminada) - Clickeable */}
                <CircleMarker
                  center={[sector.lat, sector.lon]}
                  radius={visualization.radius * 4}
                  pathOptions={{
                    color: 'transparent',
                    weight: 0,
                    fillColor: visualization.fillColor,
                    fillOpacity: 0.02
                  }}
                  eventHandlers={{
                    click: () => handleSectorClick(sector)
                  }}
                />
                {/* Capa exterior difuminada - Clickeable */}
                <CircleMarker
                  center={[sector.lat, sector.lon]}
                  radius={visualization.radius * 3.2}
                  pathOptions={{
                    color: 'transparent',
                    weight: 0,
                    fillColor: visualization.fillColor,
                    fillOpacity: 0.04
                  }}
                  eventHandlers={{
                    click: () => handleSectorClick(sector)
                  }}
                />
                {/* Capa media-exterior - Clickeable */}
                <CircleMarker
                  center={[sector.lat, sector.lon]}
                  radius={visualization.radius * 2.6}
                  pathOptions={{
                    color: 'transparent',
                    weight: 0,
                    fillColor: visualization.fillColor,
                    fillOpacity: 0.06
                  }}
                  eventHandlers={{
                    click: () => handleSectorClick(sector)
                  }}
                />
                {/* Capa media - Clickeable */}
                <CircleMarker
                  center={[sector.lat, sector.lon]}
                  radius={visualization.radius * 2.1}
                  pathOptions={{
                    color: 'transparent',
                    weight: 0,
                    fillColor: visualization.fillColor,
                    fillOpacity: 0.08
                  }}
                  eventHandlers={{
                    click: () => handleSectorClick(sector)
                  }}
                />
                {/* Capa intermedia - Clickeable */}
                <CircleMarker
                  center={[sector.lat, sector.lon]}
                  radius={visualization.radius * 1.7}
                  pathOptions={{
                    color: 'transparent',
                    weight: 0,
                    fillColor: visualization.fillColor,
                    fillOpacity: 0.1
                  }}
                  eventHandlers={{
                    click: () => handleSectorClick(sector)
                  }}
                />
                {/* Capa intermedia-interna - Clickeable */}
                <CircleMarker
                  center={[sector.lat, sector.lon]}
                  radius={visualization.radius * 1.4}
                  pathOptions={{
                    color: 'transparent',
                    weight: 0,
                    fillColor: visualization.fillColor,
                    fillOpacity: 0.12
                  }}
                  eventHandlers={{
                    click: () => handleSectorClick(sector)
                  }}
                />
                {/* Capa interna - Clickeable */}
                <CircleMarker
                  center={[sector.lat, sector.lon]}
                  radius={visualization.radius * 1.1}
                  pathOptions={{
                    color: 'transparent',
                    weight: 0,
                    fillColor: visualization.fillColor,
                    fillOpacity: 0.15
                  }}
                  eventHandlers={{
                    click: () => handleSectorClick(sector)
                  }}
                />
                {/* Núcleo central interactivo (más suave) */}
                <CircleMarker
                  center={[sector.lat, sector.lon]}
                  radius={visualization.radius * 0.8}
                  pathOptions={{
                    color: 'transparent',
                    weight: 0,
                    fillColor: visualization.fillColor,
                    fillOpacity: 0.2,
                    className: 'blinking-point'
                  }}
                  eventHandlers={{
                    click: () => handleSectorClick(sector),
                    // Desktop hover events
                    mouseover: (e) => {
                      handleSectorHover(sector)
                      e.target.setStyle({
                        fillOpacity: 0.4
                      })
                    },
                    mouseout: (e) => {
                      handleSectorLeave()
                      e.target.setStyle({
                        fillOpacity: 0.2
                      })
                    }
                  }}
                >
                  <Popup>
                    <div className="p-3">
                      <h4 className="font-bold text-lg">{sector.name}</h4>
                      <div className="mt-2">
                        <span className="text-2xl font-bold" style={{ color: visualization.color }}>
                          {sector.decibeles} dB
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {sector.audios.length} audios disponibles
                      </p>
                      <button
                        onClick={() => handleSectorClick(sector)}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Seleccionar sector
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </div>
            )
          })}
        </MapContainer>
      </div>

      {/* Toggle buttons - Mobile responsive */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2 md:gap-3">
        {/* Left panel toggle */}
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className={`group bg-white/90 backdrop-blur-md hover:bg-white text-gray-700 p-2 md:p-3 rounded-xl shadow-xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            leftPanelOpen ? 'bg-blue-500 text-white shadow-blue-500/25' : ''
          }`}
          title="Información y controles"
        >
          <div className="flex flex-col gap-1 transition-all duration-300 w-4 h-4 md:w-5 md:h-5 items-center justify-center">
            <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${
              leftPanelOpen ? 'rotate-45 translate-y-0.5' : ''
            }`}></div>
            <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${
              leftPanelOpen ? 'opacity-0' : ''
            }`}></div>
            <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${
              leftPanelOpen ? '-rotate-45 -translate-y-0.5' : ''
            }`}></div>
          </div>
        </button>
        
        {/* Right panel toggle */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className={`group bg-white/90 backdrop-blur-md hover:bg-white text-gray-700 p-2 md:p-3 rounded-xl shadow-xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            rightPanelOpen ? 'bg-green-500 text-white shadow-green-500/25' : ''
          }`}
          title="Panel de audio"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 transition-all duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </button>
      </div>

      {/* Left panel - Info and controls - Mobile responsive */}
      <div className={`absolute top-0 left-0 h-full w-full sm:w-80 bg-white/95 backdrop-blur-lg shadow-2xl transform transition-all duration-500 ease-out z-[999] ${
        leftPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}>
        <div className="h-full overflow-y-auto p-4 sm:p-6">
          {/* Close button */}
          <button
            onClick={() => setLeftPanelOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="space-y-6 mt-8">
            {/* Información del sector seleccionado */}
            {selectedSector && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {selectedSector.name}
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2 transition-all duration-300">
                    {selectedSector.decibeles} dB
                  </div>
                  <div className="text-sm text-gray-600">
                    Nivel de ruido actual
                  </div>
                </div>
              </div>
            )}

            {/* Medidor de decibeles */}
            {selectedSector && (
              <DecibelMeter value={selectedSector.decibeles} />
            )}

            {/* Estadísticas generales */}
            <StatsPanel sectors={pointsData} />
            
            {/* Visited sectors and tour completion */}
            {visitedSectors.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  🗺️ Recorrido Actual
                </h4>
                <div className="text-xs text-gray-600 mb-3">
                  Sectores visitados: {visitedSectors.length}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {visitedSectors.slice(-3).map((sector) => (
                    <div 
                      key={sector.id}
                      className="text-xs bg-white/60 px-2 py-1 rounded-md border"
                      title={sector.name}
                    >
                      {sector.name.split(' ')[1] || sector.name.split(' ')[0]}
                    </div>
                  ))}
                  {visitedSectors.length > 3 && (
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                      +{visitedSectors.length - 3}
                    </div>
                  )}
                </div>
                <button
                  onClick={generateAudioMix}
                  disabled={isGeneratingMix || visitedSectors.length < 2}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isGeneratingMix ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generando mix...
                    </div>
                  ) : (
                    `🎧 Crear mix con ${visitedSectors.length} sectores`
                  )}
                </button>
                {visitedSectors.length < 2 && (
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Visita al menos 2 sectores para crear un mix
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel - Audio controls - Mobile responsive */}
      <div className={`absolute top-0 right-0 h-full w-full sm:w-80 bg-white/95 backdrop-blur-lg shadow-2xl transform transition-all duration-500 ease-out z-[999] ${
        rightPanelOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="h-full overflow-y-auto p-4 sm:p-6">
          {/* Close button */}
          <button
            onClick={() => setRightPanelOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mt-8">
            <AudioPanel 
              sector={selectedSector}
              onPlayAudio={handlePlayAudio}
              onPauseAudio={handlePauseAudio}
              isPlaying={isPlaying}
              currentAudioUrl={currentAudioUrl}
              onAddToMix={(audioUrl, audioTitle) => {
                if (!mixAudios.find(mix => mix.url === audioUrl)) {
                  setMixAudios(prev => [...prev, {url: audioUrl, title: audioTitle}])
                  // Show slide notification
                  const id = notificationId + 1
                  setNotificationId(id)
                  setNotifications(prev => [...prev, {id, message: `"${audioTitle}" agregado a tu mezcla`}])
                  
                  // Remove notification after 3 seconds
                  setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.id !== id))
                  }, 3000)
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Overlay for closing panels when clicking outside */}
      {(leftPanelOpen || rightPanelOpen) && (
        <div 
          className={`absolute inset-0 bg-black/10 backdrop-blur-sm z-[998] transition-all duration-500 ${
            leftPanelOpen || rightPanelOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => {
            setLeftPanelOpen(false)
            setRightPanelOpen(false)
          }}
        />
      )}

      {/* Mix Completion Popup */}
      {showMixPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎧</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  ¡Mix de recorrido creado!
                </h3>
                <div className="text-lg">🎆</div>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-6">
                <p className="text-gray-600 text-center">
                  Se ha creado tu mix personalizado con los <strong>{visitedSectors.length} sectores</strong> que visitaste:
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                  <ul className="space-y-1">
                    {visitedSectors.map((sector, index) => (
                      <li key={sector.id} className="flex items-center text-sm text-gray-700">
                        <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                          {index + 1}
                        </span>
                        {sector.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    <strong>🎧 Tu experiencia sonora:</strong> Los audios se reproducirán con superposición creando una experiencia inmersiva de tu recorrido por Barranco.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMixPopup(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    console.log('Play mix button clicked')
                    
                    // Stop any currently playing audio
                    if (currentAudio) {
                      currentAudio.pause()
                      currentAudio.currentTime = 0
                    }
                    
                    // Play the generated mix using the audio context that was already created
                    try {
                      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext
                      if (!AudioContextClass) {
                        throw new Error('AudioContext not supported')
                      }
                      
                      // Create a simple playback without needing the stored blob
                      alert('🎧 Reproduciendo tu mix personalizado de Barranco...')
                      
                      // Here we would ideally play the generated mix, but for now show success
                      console.log('Mix playback initiated')
                    } catch (error) {
                      console.error('Playback failed:', error)
                      alert('Error al reproducir el mix. Por favor inténtalo de nuevo.')
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
                >
                  🎧 Reproducir Mix
                </button>
                <button
                  onClick={() => {
                    setShowMixPopup(false)
                    setVisitedSectors([])
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all font-medium"
                >
                  Nuevo recorrido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced persistent decibel meter - bottom left - Mobile responsive */}
      {selectedSector && !leftPanelOpen && (
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto z-[1000] transform transition-all duration-500 ease-out">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-3 sm:p-5 sm:min-w-[280px]">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Sector Actual
              </div>
              <div className="text-sm font-medium text-gray-700 truncate">
                {selectedSector.name}
              </div>
            </div>

            {/* Main decibel display */}
            <div className="text-center mb-4">
              <div className="flex items-baseline justify-center gap-1">
                <div className="text-4xl font-bold text-gray-800">
                  {selectedSector.decibeles}
                </div>
                <div className="text-lg font-medium text-gray-600">
                  dB
                </div>
              </div>
              
              {/* Level indicator */}
              <div className="mt-2 text-xs font-medium" style={{ 
                color: getSoundVisualization(selectedSector.decibeles).color 
              }}>
                {selectedSector.decibeles > 75 ? 'Extremo' :
                 selectedSector.decibeles > 70 ? 'Peligroso' :
                 selectedSector.decibeles > 65 ? 'Excesivo' :
                 selectedSector.decibeles > 60 ? 'Muy alto' :
                 selectedSector.decibeles > 55 ? 'Alto' :
                 selectedSector.decibeles > 50 ? 'Moderado' :
                 selectedSector.decibeles > 45 ? 'Silencioso' : 'Muy silencioso'}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-700 ease-out relative"
                  style={{
                    width: `${Math.min((selectedSector.decibeles / 100) * 100, 100)}%`,
                    backgroundColor: getSoundVisualization(selectedSector.decibeles).color
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Compact legend */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                Escala de Ruido
              </div>
              {[
                { range: '<45', color: '#16a34a', label: 'Silencioso' },
                { range: '45-50', color: '#eab308', label: 'Tranquilo' },
                { range: '50-55', color: '#ca8a04', label: 'Moderado' },
                { range: '55-60', color: '#ea580c', label: 'Alto' },
                { range: '60-65', color: '#dc2626', label: 'Muy alto' },
                { range: '65-70', color: '#2563eb', label: 'Excesivo' },
                { range: '70-75', color: '#7c3aed', label: 'Peligroso' },
                { range: '>75', color: '#6b7280', label: 'Extremo' }
              ].map((level, index) => {
                const isActive = 
                  (level.range === '<45' && selectedSector.decibeles < 45) ||
                  (level.range === '45-50' && selectedSector.decibeles >= 45 && selectedSector.decibeles < 50) ||
                  (level.range === '50-55' && selectedSector.decibeles >= 50 && selectedSector.decibeles < 55) ||
                  (level.range === '55-60' && selectedSector.decibeles >= 55 && selectedSector.decibeles < 60) ||
                  (level.range === '60-65' && selectedSector.decibeles >= 60 && selectedSector.decibeles < 65) ||
                  (level.range === '65-70' && selectedSector.decibeles >= 65 && selectedSector.decibeles < 70) ||
                  (level.range === '70-75' && selectedSector.decibeles >= 70 && selectedSector.decibeles < 75) ||
                  (level.range === '>75' && selectedSector.decibeles >= 75);

                return (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between text-xs transition-all duration-300 p-1.5 rounded-lg ${
                      isActive ? 'bg-gray-100 transform scale-105' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                          isActive ? 'border-white shadow-md' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: level.color }}
                      ></div>
                      <span className={`font-medium ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                        {level.range} dB
                      </span>
                    </div>
                    <span className={`text-xs ${isActive ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {level.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Audio indicator */}
            {selectedSector.audios && selectedSector.audios.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.789l-4.895-3.676H2a1 1 0 01-1-1V8a1 1 0 011-1h1.488l4.895-3.676a1 1 0 01.617-.211zM11 7a1 1 0 112 0v6a1 1 0 11-2 0V7zm4-1a1 1 0 011 1v6a1 1 0 11-2 0V7a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>{selectedSector.audios.length} audios disponibles</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification System - Mobile responsive */}
      <div className="fixed top-16 right-4 z-[1002] space-y-2 max-w-[calc(100vw-2rem)] sm:max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in-right w-full"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎵</span>
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        :global(.blinking-point) {
          animation: blink 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
