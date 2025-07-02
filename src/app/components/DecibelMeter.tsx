'use client'

import { useEffect, useState } from 'react'

interface DecibelMeterProps {
  value: number
  maxValue?: number
}

export default function DecibelMeter({ value, maxValue = 100 }: DecibelMeterProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  // Calcular el porcentaje para la barra
  const percentage = Math.min((animatedValue / maxValue) * 100, 100)
  
  // Determinar color según el nivel
  const getColor = (val: number) => {
    if (val > 75) return '#6b7280' // gray
    if (val > 70) return '#7c3aed' // purple
    if (val > 65) return '#2563eb' // blue
    if (val > 60) return '#dc2626' // red
    if (val > 55) return '#ea580c' // orange
    if (val > 50) return '#ca8a04' // darker yellow
    if (val > 45) return '#eab308' // light yellow
    return '#16a34a' // green
  }

  const color = getColor(animatedValue)

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
        Medidor de Decibeles
      </h3>
      
      {/* Medidor circular */}
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Círculo de fondo */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            {/* Círculo de progreso */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeDasharray={`${percentage}, 100`}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          
          {/* Valor en el centro */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {Math.round(animatedValue)}
              </div>
              <div className="text-xs text-gray-600 font-medium">dB</div>
            </div>
          </div>
        </div>
      </div>

      {/* Escala de referencia */}
      <div className="space-y-1 text-black">
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#16a34a'}}></div>
            &lt;45 dB: Muy silencioso
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#eab308'}}></div>
            45-50 dB: Silencioso
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 text-black" style={{backgroundColor: '#ca8a04'}}></div>
            50-55 dB: Moderado
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#ea580c'}}></div>
            55-60 dB: Alto
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#dc2626'}}></div>
            60-65 dB: Muy alto
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#2563eb'}}></div>
            65-70 dB: Excesivo
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#7c3aed'}}></div>
            70-75 dB: Peligroso
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#6b7280'}}></div>
            &gt;75 dB: Extremo
          </span>
        </div>
      </div>

      {/* Barra horizontal adicional */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
