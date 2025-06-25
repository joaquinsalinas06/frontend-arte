// Utilidad para cargar y procesar el archivo Barranco.geojson

export interface BarrancoCoordinates {
  coordinates: [number, number][]
  center: [number, number]
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
}

// Tipos para geometrías GeoJSON
interface GeoJsonPolygonCoordinates {
  type: 'Polygon'
  coordinates: [number, number][][]
}

interface GeoJsonMultiPolygonCoordinates {
  type: 'MultiPolygon'
  coordinates: [number, number][][][]
}

interface GeoJsonFeature {
  geometry: GeoJsonPolygonCoordinates | GeoJsonMultiPolygonCoordinates
  properties: Record<string, unknown>
}

export async function loadBarrancoCoordinates(): Promise<BarrancoCoordinates | null> {
  try {
    const response = await fetch('/Barranco.geojson')
    const geoJsonData: { features: GeoJsonFeature[] } = await response.json()
    
    // Extraer las coordenadas del primer feature
    const feature = geoJsonData.features[0]
    if (!feature || !feature.geometry || !feature.geometry.coordinates) {
      throw new Error('GeoJSON no tiene el formato esperado')
    }
    
    let coords: [number, number][] = []
    
    // Manejar diferentes tipos de geometría
    if (feature.geometry.type === 'Polygon') {
      // Para Polygon, tomar el anillo exterior
      coords = feature.geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]])
    } else if (feature.geometry.type === 'MultiPolygon') {
      // Para MultiPolygon, tomar el polígono más grande
      const polygons = feature.geometry.coordinates
      const largestPolygon = polygons.reduce((largest: [number, number][][], current: [number, number][][]) => 
        current[0].length > largest[0].length ? current : largest
      )
      coords = largestPolygon[0].map((coord: [number, number]) => [coord[1], coord[0]])
    }
    
    // Calcular centro geográfico
    const lats = coords.map(coord => coord[0])
    const lons = coords.map(coord => coord[1])
    
    const center: [number, number] = [
      lats.reduce((sum, lat) => sum + lat, 0) / lats.length,
      lons.reduce((sum, lon) => sum + lon, 0) / lons.length
    ]
    
    // Calcular límites
    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lons),
      west: Math.min(...lons)
    }
    
    return {
      coordinates: coords,
      center,
      bounds
    }
    
  } catch (error) {
    console.error('Error cargando coordenadas de Barranco:', error)
    return null
  }
}
