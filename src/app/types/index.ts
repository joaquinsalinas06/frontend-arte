export interface AudioData {
  titulo: string
  descripcion: string
  url: string
  tipo: 'ambiente' | 'trafico' | 'comercial'
}

export interface SectorData {
  id: number
  name: string
  lat: number
  lon: number
  decibeles: number
  audios: AudioData[]
  polygon?: [number, number][]
  color?: string
}

export interface SectorsData {
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

export interface PointsData {
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