'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SectorData } from '../types'

interface StatsPanelProps {
  sectors: SectorData[]
}

export default function StatsPanel({ sectors }: StatsPanelProps) {
  // Calcular estadísticas
  const totalSectors = sectors.length
  const averageDecibels = Math.round(
    sectors.reduce((sum, sector) => sum + sector.decibeles, 0) / totalSectors
  )
  const maxDecibels = Math.max(...sectors.map(s => s.decibeles))
  const minDecibels = Math.min(...sectors.map(s => s.decibeles))
  const highNoiseSectors = sectors.filter(s => s.decibeles > 60).length
  const totalAudios = sectors.reduce((sum, sector) => sum + sector.audios.length, 0)

  // Datos para el gráfico
  const chartData = sectors.map(sector => ({
    name: sector.name.split(' ')[0], // Solo primera palabra para que quepa
    decibeles: sector.decibeles,
    fill: sector.decibeles > 75 ? '#6b7280' : 
          sector.decibeles > 70 ? '#7c3aed' :
          sector.decibeles > 65 ? '#2563eb' :
          sector.decibeles > 60 ? '#dc2626' :
          sector.decibeles > 55 ? '#ea580c' :
          sector.decibeles > 50 ? '#ca8a04' :
          sector.decibeles > 45 ? '#eab308' : '#16a34a'
  }))

  return (
    <div className="space-y-4">
      {/* Estadísticas principales */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-3 text-center">
          📊 Estadísticas del Sistema
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-200">{totalSectors}</div>
            <div className="text-xs opacity-90">Sectores</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-red-200">{averageDecibels}</div>
            <div className="text-xs opacity-90">Promedio dB</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-orange-200">{highNoiseSectors}</div>
            <div className="text-xs opacity-90">Zonas Críticas</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-green-200">{totalAudios}</div>
            <div className="text-xs opacity-90">Audios Total</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20 text-center">
          <div className="text-xs opacity-80">
            🕒 Actualizado: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="font-semibold mb-3 text-gray-700">
          Niveles por Sector
        </h4>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis fontSize={10} />
              <Tooltip 
                formatter={(value: number) => [`${value} dB`, 'Decibeles']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar 
                dataKey="decibeles" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rangos de ruido */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="font-semibold mb-3 text-gray-700">
          Distribución por Niveles ({totalSectors} muestras)
        </h4>
        
        <div className="space-y-2">
          {[
            { range: '< 50 dB', label: 'Muy silencioso', color: '#16a34a', count: sectors.filter(s => s.decibeles < 50).length },
            { range: '50-55 dB', label: 'Silencioso', color: '#22c55e', count: sectors.filter(s => s.decibeles >= 50 && s.decibeles < 55).length },
            { range: '55-60 dB', label: 'Moderado', color: '#eab308', count: sectors.filter(s => s.decibeles >= 55 && s.decibeles < 60).length },
            { range: '60-65 dB', label: 'Moderado-Alto', color: '#f59e0b', count: sectors.filter(s => s.decibeles >= 60 && s.decibeles < 65).length },
            { range: '65-70 dB', label: 'Alto', color: '#ea580c', count: sectors.filter(s => s.decibeles >= 65 && s.decibeles < 70).length },
            { range: '70-75 dB', label: 'Muy Alto', color: '#dc2626', count: sectors.filter(s => s.decibeles >= 70 && s.decibeles < 75).length },
            { range: '≥ 75 dB', label: 'Extremo', color: '#991b1b', count: sectors.filter(s => s.decibeles >= 75).length }
          ].map((level, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 border border-gray-300" style={{backgroundColor: level.color}}></div>
                <span className="text-gray-800 font-medium">{level.range}</span>
                <span className="text-gray-500 text-xs ml-1">({level.label})</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-700 mr-2 font-medium">{level.count}</span>
                <span className="text-gray-500 text-xs mr-2">({Math.round((level.count / totalSectors) * 100)}%)</span>
                <div className="w-12 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(4, (level.count / totalSectors) * 100)}%`,
                      backgroundColor: level.color
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Total de puntos de medición: {totalSectors} | Promedio general: {averageDecibels} dB
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-semibold mb-2 text-gray-700">
          📈 Resumen
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Rango: {minDecibels} - {maxDecibels} dB</p>
          <p>• Sector más ruidoso: {sectors.find(s => s.decibeles === maxDecibels)?.name}</p>
          <p>• Sector más silencioso: {sectors.find(s => s.decibeles === minDecibels)?.name}</p>
        </div>
      </div>
    </div>
  )
}
