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

// Sectores oficiales de Barranco con coordenadas ajustadas a los límites reales
const sectorsData: SectorData[] = [
  {
    id: 0,
    name: 'Sector SS-1A',
    lat: -12.1370,
    lon: -77.0240,
    decibeles: 55,
    audios: [
      {
        titulo: 'Zona Residencial Norte',
        descripcion: 'Ambiente tranquilo de área residencial con tráfico ligero',
        url: '/audios/ss1a_ambiente.mp3',
        tipo: 'ambiente'
      },
      {
        titulo: 'Av. República de Panamá',
        descripcion: 'Tráfico vehicular en hora punta',
        url: '/audios/ss1a_trafico.mp3',
        tipo: 'trafico'
      }
    ]
  },
  {
    id: 1,
    name: 'Sector SS-1B',
    lat: -12.1395,
    lon: -77.0220,
    decibeles: 68,
    audios: [
      {
        titulo: 'Plaza de Barranco',
        descripcion: 'Centro neurálgico con actividad comercial y turística',
        url: '/audios/ss1b_plaza.mp3',
        tipo: 'comercial'
      },
      {
        titulo: 'Música y Arte Callejero',
        descripcion: 'Artistas y músicos en la plaza principal',
        url: '/audios/ss1b_arte.mp3',
        tipo: 'comercial'
      }
    ]
  },
  {
    id: 2,
    name: 'Sector SS-2A',
    lat: -12.1400,
    lon: -77.0195,
    decibeles: 78,
    audios: [
      {
        titulo: 'Av. Grau - Tráfico Intenso',
        descripcion: 'Una de las avenidas más transitadas de Barranco',
        url: '/audios/ss2a_grau.mp3',
        tipo: 'trafico'
      },
      {
        titulo: 'Comercio Diurno',
        descripcion: 'Actividad comercial intensa durante el día',
        url: '/audios/ss2a_comercio.mp3',
        tipo: 'comercial'
      }
    ]
  },
  {
    id: 3,
    name: 'Sector SS-2B',
    lat: -12.1420,
    lon: -77.0180,
    decibeles: 42,
    audios: [
      {
        titulo: 'Puente de los Suspiros',
        descripcion: 'Zona turística tranquila y romántica',
        url: '/audios/ss2b_puente.mp3',
        tipo: 'ambiente'
      },
      {
        titulo: 'Bajada de los Baños',
        descripcion: 'Ambiente costero con sonidos del mar',
        url: '/audios/ss2b_bajada.mp3',
        tipo: 'ambiente'
      }
    ]
  },
  {
    id: 4,
    name: 'Sector SS-2C',
    lat: -12.1450,
    lon: -77.0190,
    decibeles: 48,
    audios: [
      {
        titulo: 'Malecón de Barranco',
        descripcion: 'Brisa marina y ambiente costero relajante',
        url: '/audios/ss2c_malecon.mp3',
        tipo: 'ambiente'
      },
      {
        titulo: 'Olas del Pacífico',
        descripcion: 'Sonidos naturales del océano',
        url: '/audios/ss2c_mar.mp3',
        tipo: 'ambiente'
      }
    ]
  },
  {
    id: 5,
    name: 'Sector C1 (Norte)',
    lat: -12.1380,
    lon: -77.0250,
    decibeles: 72,
    audios: [
      {
        titulo: 'Calle Ayacucho',
        descripcion: 'Vida nocturna y bares bohemios',
        url: '/audios/c1_ayacucho.mp3',
        tipo: 'comercial'
      },
      {
        titulo: 'Tráfico Urbano Nocturno',
        descripcion: 'Circulación vehicular en horario nocturno',
        url: '/audios/c1_nocturno.mp3',
        tipo: 'trafico'
      }
    ]
  },
  {
    id: 6,
    name: 'Sector C2 (Sur)',
    lat: -12.1430,
    lon: -77.0210,
    decibeles: 38,
    audios: [
      {
        titulo: 'Parque Municipal',
        descripcion: 'Zona verde con actividades recreativas',
        url: '/audios/c2_parque.mp3',
        tipo: 'ambiente'
      },
      {
        titulo: 'Área Residencial Tranquila',
        descripcion: 'Ambiente residencial con baja densidad sonora',
        url: '/audios/c2_residencial.mp3',
        tipo: 'ambiente'
      }
    ]
  },
  {
    id: 7,
    name: 'Zona Chorrillos (Límite)',
    lat: -12.1455,
    lon: -77.0175,
    decibeles: 35,
    audios: [
      {
        titulo: 'Límite Distrital',
        descripcion: 'Zona limítrofe con Chorrillos, muy tranquila',
        url: '/audios/limite_chorrillos.mp3',
        tipo: 'ambiente'
      }
    ]
  }
]



// Función para obtener color y configuración de mancha según decibeles
const getSoundVisualization = (decibeles: number) => {
  if (decibeles > 75) {
    return {
      color: '#dc2626', // rojo intenso
      fillColor: '#dc2626',
      fillOpacity: 0.6,
      radius: 80,
      weight: 0,
      className: 'sound-spot-high'
    }
  } else if (decibeles > 55) {
    return {
      color: '#ea580c', // naranja
      fillColor: '#ea580c', 
      fillOpacity: 0.5,
      radius: 60,
      weight: 0,
      className: 'sound-spot-medium-high'
    }
  } else if (decibeles > 35) {
    return {
      color: '#ca8a04', // amarillo
      fillColor: '#ca8a04',
      fillOpacity: 0.4,
      radius: 40,
      weight: 0,
      className: 'sound-spot-medium'
    }
  } else {
    return {
      color: '#16a34a', // verde
      fillColor: '#16a34a',
      fillOpacity: 0.3,
      radius: 25,
      weight: 0,
      className: 'sound-spot-low'
    }
  }
}

export default function AcousticMap() {
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(sectorsData[0])
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAllSectors, setShowAllSectors] = useState(true)
  const [selectedSectorTypes, setSelectedSectorTypes] = useState<string[]>(['SS-1A', 'SS-1B', 'SS-2A', 'SS-2B', 'SS-2C', 'C1', 'C2'])
  const [barrancoData, setBarrancoData] = useState<BarrancoCoordinates | null>(null)
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(true)

  // Cargar coordenadas reales de Barranco al montar el componente
  useEffect(() => {
    const loadCoordinates = async () => {
      setIsLoadingCoordinates(true)
      const coordinates = await loadBarrancoCoordinates()
      setBarrancoData(coordinates)
      setIsLoadingCoordinates(false)
    }
    
    loadCoordinates()
  }, [])

  // Función para reproducir audio
  const playAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause()
    }
    
    const audio = new Audio(audioUrl)
    audio.play().catch(() => {
      console.log('Audio no disponible:', audioUrl)
    })
    
    setCurrentAudio(audio)
    setIsPlaying(true)
    
    audio.onended = () => {
      setIsPlaying(false)
    }
  }

  // Función para pausar audio
  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      setIsPlaying(false)
    }
  }

  // Función para manejar selección de sector (con throttling para hover)
  const handleSectorSelect = (sector: SectorData) => {
    // Solo cambiar si es realmente un sector diferente
    if (selectedSector?.id === sector.id) return
    
    setSelectedSector(sector)
    
    // Solo pausar audio si está reproduciéndose, no cambiarlo automáticamente en hover
    // El usuario puede decidir cuándo reproducir el audio del nuevo sector
    if (currentAudio && isPlaying) {
      currentAudio.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="w-full h-screen flex">
      {/* Panel Izquierdo - Información y Medidor */}
      <div className="w-1/4 p-4 bg-white border-r border-gray-200 overflow-y-auto">
        {/* Información del Sector Actual */}
        <div className="mb-6">
          <div className={`p-4 rounded-lg text-white ${
            selectedSector && selectedSector.decibeles > 75 ? 'bg-red-500' :
            selectedSector && selectedSector.decibeles > 55 ? 'bg-orange-500' :
            selectedSector && selectedSector.decibeles > 35 ? 'bg-yellow-500' :
            'bg-green-500'
          }`}>
            <h3 className="text-lg font-bold mb-2">
              📍 {selectedSector?.name || 'Selecciona un sector'}
            </h3>
            <div className="text-2xl font-bold">
              {selectedSector?.decibeles || 0} dB
            </div>
            <p className="text-sm opacity-90">
              {selectedSector && selectedSector.decibeles > 75 && '🔴 Nivel muy alto'}
              {selectedSector && selectedSector.decibeles > 55 && selectedSector.decibeles <= 75 && '🟡 Nivel alto'}
              {selectedSector && selectedSector.decibeles > 35 && selectedSector.decibeles <= 55 && '🟨 Nivel moderado'}
              {selectedSector && selectedSector.decibeles <= 35 && '🟢 Nivel bajo'}
            </p>
          </div>
        </div>

        {/* Medidor de Decibeles */}
        <div className="mb-6">
          <DecibelMeter value={selectedSector?.decibeles || 0} />
        </div>

        {/* Control de Sectores */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              🎛️ Control de Sectores
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600">
                  Mostrar todos los sectores
                </label>
                <input
                  type="checkbox"
                  checked={showAllSectors}
                  onChange={(e) => setShowAllSectors(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">Filtrar por tipo de sector:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['SS-1A', 'SS-1B', 'SS-2A', 'SS-2B', 'SS-2C', 'C1', 'C2'].map((type) => (
                    <label key={type} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={selectedSectorTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSectorTypes([...selectedSectorTypes, type])
                          } else {
                            setSelectedSectorTypes(selectedSectorTypes.filter(t => t !== type))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-600">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-1">Acciones rápidas:</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedSectorTypes(['SS-1A', 'SS-1B', 'SS-2A', 'SS-2B', 'SS-2C', 'C1', 'C2'])}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedSectorTypes([])}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Ninguno
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <StatsPanel sectors={sectorsData} />
      </div>

      {/* Mapa Central */}
      <div className="flex-1 relative">
        <MapContainer
          center={barrancoData?.center || [-12.1410, -77.0225]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Polígono de Barranco con coordenadas reales del GeoJSON */}
          {barrancoData && !isLoadingCoordinates && (
            <Polygon
              positions={barrancoData.coordinates}
              pathOptions={{
                color: '#e74c3c',
                weight: 2,
                opacity: 0.9,
                fillColor: '#3498db',
                fillOpacity: 0.1,
              }}
            >
              <Popup>
                <div className="p-3">
                  <h4 className="font-bold text-lg text-red-600">Distrito de Barranco</h4>
                  <p className="text-sm text-gray-600">
                    Lima, Perú - Límites oficiales
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {sectorsData.length} sectores monitoreados
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Coordenadas del archivo GeoJSON oficial
                  </p>
                </div>
              </Popup>
            </Polygon>
          )}
          
          {sectorsData
            .filter(sector => {
              if (!showAllSectors) return false
              const sectorType = sector.name.split(' ')[1] // Extraer tipo (SS-1A, SS-1B, etc.)
              return selectedSectorTypes.includes(sectorType)
            })
            .map((sector) => {
              const visualization = getSoundVisualization(sector.decibeles)
              return (
                <CircleMarker
                  key={sector.id}
                  center={[sector.lat, sector.lon]}
                  pathOptions={visualization}
                  radius={visualization.radius}
                  eventHandlers={{
                    mouseover: () => handleSectorSelect(sector), // Cambiar al hacer hover
                    click: () => handleSectorSelect(sector), // Mantener también el click
                  }}
                >
                  <Popup>
                    <div className="p-3 max-w-xs">
                      <h4 className="font-bold text-lg text-blue-600">{sector.name}</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-semibold">Nivel de ruido:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                            sector.decibeles > 75 ? 'bg-red-100 text-red-800' :
                            sector.decibeles > 55 ? 'bg-orange-100 text-orange-800' :
                            sector.decibeles > 35 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {sector.decibeles} dB
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          📍 Coordenadas: {sector.lat.toFixed(4)}, {sector.lon.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-500">
                          🎵 {sector.audios.length} audio(s) disponible(s)
                        </p>
                      </div>
                      <button
                        onClick={() => handleSectorSelect(sector)}
                        className="mt-3 w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        📊 Ver detalles completos
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
        </MapContainer>
      </div>

      {/* Panel Derecho - Audios */}
      <div className="w-1/4 p-4 bg-gray-50 overflow-y-auto">
        <AudioPanel
          sector={selectedSector}
          onPlayAudio={playAudio}
          onPauseAudio={pauseAudio}
          isPlaying={isPlaying}
        />
      </div>
    </div>
  )
}
