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
  polygon?: [number, number][]
  color?: string
  audios: AudioData[]
}

interface ExtractedSectorsData {
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
  sectores: SectorData[]
}

// Función para cargar sectores extraídos desde el archivo JSON
async function loadExtractedSectors(): Promise<SectorData[]> {
  try {
    const response = await fetch('/data/barranco_sectors_extracted.json')
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo de sectores')
    }
    
    const data: ExtractedSectorsData = await response.json()
    return data.sectores || []
  } catch (error) {
    console.error('Error cargando sectores extraídos:', error)
    return []
  }
}

// Función para obtener color y configuración de mancha según decibeles
const getSoundVisualization = (decibeles: number) => {
  if (decibeles > 75) {
    return {
      color: '#dc2626', // rojo intenso
      fillColor: '#dc2626',
      opacity: 0.6,
      fillOpacity: 0.3,
      radius: 35
    }
  } else if (decibeles > 60) {
    return {
      color: '#ea580c', // naranja
      fillColor: '#ea580c', 
      opacity: 0.5,
      fillOpacity: 0.25,
      radius: 30
    }
  } else if (decibeles > 45) {
    return {
      color: '#eab308', // amarillo
      fillColor: '#eab308',
      opacity: 0.4,
      fillOpacity: 0.2,
      radius: 25
    }
  } else {
    return {
      color: '#16a34a', // verde
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
  const [sectorsData, setSectorsData] = useState<SectorData[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar coordenadas de Barranco
        const coords = await loadBarrancoCoordinates()
        setBarrancoCoords(coords)

        // Cargar sectores extraídos
        const sectors = await loadExtractedSectors()
        setSectorsData(sectors)
        
        // Seleccionar el primer sector por defecto
        if (sectors.length > 0) {
          setSelectedSector(sectors[0])
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSectorClick = (sector: SectorData) => {
    setSelectedSector(sector)
  }

  const handleSectorHover = (sector: SectorData) => {
    setSelectedSector(sector)
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
    }

    setCurrentAudio(audio)
    setIsPlaying(true)
  }

  const handlePauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
    }
    setIsPlaying(false)
    setCurrentAudio(null)
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
    <div className="flex flex-col space-y-4 sm:space-y-6">
      {/* Layout móvil: Todo en columna, Desktop: 3 columnas */}
      
      {/* Panel superior en móviles - Información del sector seleccionado */}
      {selectedSector && (
        <div className="block lg:hidden bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 text-center">
            {selectedSector.name}
          </h3>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {selectedSector.decibeles} dB
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">
              Nivel de ruido actual
            </div>
          </div>
        </div>
      )}

      {/* Layout desktop y tablet */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 lg:gap-6">
        
        {/* Panel izquierdo - Información y controles (oculto en móvil) */}
        <div className="hidden lg:block lg:w-1/4 space-y-6">
          {/* Información del sector seleccionado */}
          {selectedSector && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {selectedSector.name}
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {selectedSector.decibeles} dB
                </div>
                <div className="text-sm text-gray-600 mt-1">
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
          <StatsPanel sectors={sectorsData} />
        </div>

        {/* Panel central - Mapa (responsivo) */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 text-center">
              Mapa Acústico de Barranco
            </h2>
            <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden">
              <MapContainer
                center={center}
                zoom={15}
                className="h-full w-full"
                zoomControl={false}
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
                        Sectores monitoreados: {sectorsData.length}
                      </p>
                    </div>
                  </Popup>
                </Polygon>
              )}

              {/* Sectores extraídos como polígonos delimitadores (sin interacción) */}
              {sectorsData.map((sector) => (
                sector.polygon && (
                  <Polygon
                    key={`sector-${sector.id}`}
                    positions={sector.polygon}
                    pathOptions={{
                      color: sector.color || '#3b82f6',
                      weight: 1.5,
                      opacity: 0.9,
                      fillColor: sector.color || '#3b82f6',
                      fillOpacity: 0.5
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-bold text-base">{sector.name}</h4>
                        <p className="text-sm text-gray-600">
                          Sector de monitoreo delimitado
                        </p>
                      </div>
                    </Popup>
                  </Polygon>
                )
              ))}

              {/* Marcadores de sectores como puntos difuminados (mapa de calor) */}
              {sectorsData.map((sector) => {
                const visualization = getSoundVisualization(sector.decibeles)
                return (
                  <div key={`heatmap-${sector.id}`}>
                    {/* Capa más exterior (muy difuminada) */}
                    <CircleMarker
                      center={[sector.lat, sector.lon]}
                      radius={visualization.radius * 4}
                      pathOptions={{
                        color: 'transparent',
                        weight: 0,
                        fillColor: visualization.fillColor,
                        fillOpacity: 0.02
                      }}
                    />
                    {/* Capa exterior difuminada */}
                    <CircleMarker
                      center={[sector.lat, sector.lon]}
                      radius={visualization.radius * 3.2}
                      pathOptions={{
                        color: 'transparent',
                        weight: 0,
                        fillColor: visualization.fillColor,
                        fillOpacity: 0.04
                      }}
                    />
                    {/* Capa media-exterior */}
                    <CircleMarker
                      center={[sector.lat, sector.lon]}
                      radius={visualization.radius * 2.6}
                      pathOptions={{
                        color: 'transparent',
                        weight: 0,
                        fillColor: visualization.fillColor,
                        fillOpacity: 0.06
                      }}
                    />
                    {/* Capa media */}
                    <CircleMarker
                      center={[sector.lat, sector.lon]}
                      radius={visualization.radius * 2.1}
                      pathOptions={{
                        color: 'transparent',
                        weight: 0,
                        fillColor: visualization.fillColor,
                        fillOpacity: 0.08
                      }}
                    />
                    {/* Capa intermedia */}
                    <CircleMarker
                      center={[sector.lat, sector.lon]}
                      radius={visualization.radius * 1.7}
                      pathOptions={{
                        color: 'transparent',
                        weight: 0,
                        fillColor: visualization.fillColor,
                        fillOpacity: 0.1
                      }}
                    />
                    {/* Capa intermedia-interna */}
                    <CircleMarker
                      center={[sector.lat, sector.lon]}
                      radius={visualization.radius * 1.4}
                      pathOptions={{
                        color: 'transparent',
                        weight: 0,
                        fillColor: visualization.fillColor,
                        fillOpacity: 0.12
                      }}
                    />
                    {/* Capa interna */}
                    <CircleMarker
                      center={[sector.lat, sector.lon]}
                      radius={visualization.radius * 1.1}
                      pathOptions={{
                        color: 'transparent',
                        weight: 0,
                        fillColor: visualization.fillColor,
                        fillOpacity: 0.15
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
                        fillOpacity: 0.2
                      }}
                      eventHandlers={{
                        click: () => handleSectorClick(sector),
                        mouseover: (e) => {
                          handleSectorHover(sector)
                          e.target.setStyle({
                            fillOpacity: 0.4
                          })
                        },
                        mouseout: (e) => {
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
          </div>
        </div>

        {/* Panel derecho - Audios (oculto en móvil, mostrado en desktop) */}
        <div className="hidden lg:block lg:w-1/4">
          <AudioPanel 
            sector={selectedSector}
            onPlayAudio={handlePlayAudio}
            onPauseAudio={handlePauseAudio}
            isPlaying={isPlaying}
          />
        </div>
      </div>

      {/* Panel de audios para móviles (abajo del mapa) */}
      <div className="block lg:hidden">
        <AudioPanel 
          sector={selectedSector}
          onPlayAudio={handlePlayAudio}
          onPauseAudio={handlePauseAudio}
          isPlaying={isPlaying}
        />
      </div>

      {/* Panel de estadísticas para móviles */}
      <div className="block lg:hidden">
        {selectedSector && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              📊 Estadísticas del Sistema
            </h3>
            <StatsPanel sectors={sectorsData} />
          </div>
        )}
      </div>

      {/* Medidor de decibeles para móviles (al final) */}
      <div className="block lg:hidden">
        {selectedSector && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              🔊 Medidor de Ruido
            </h3>
            <DecibelMeter value={selectedSector.decibeles} />
          </div>
        )}
      </div>
    </div>
  )
}
