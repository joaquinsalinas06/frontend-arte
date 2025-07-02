'use client'

import Header from '@/app/components/Header'

export default function Credits() {
  const teamMembers = [
    { name: 'Paola Principe Cordero', code: '202120456' },
    { name: 'Rodrigo Taboada Gamboa', code: '202120556' },
    { name: 'Piero Alessandro Sánchez Garay', code: '202210321' },
    { name: 'Joaquín Emir Salazar Peña', code: '202210314' },
    { name: 'Christian Maxim Ricardo Frisancho Mayorga', code: '202210135' },
    { name: 'Joaquín Mauricio Salinas Salas', code: '202210604' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showCreditsButton={false} showBackButton={true} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Información del Proyecto */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Ecos Urbanos: Barranco a través de sus ruidos
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Información Académica</h3>
                <ul className="text-slate-600 space-y-1">
                  <li><strong>Curso:</strong> Arte y Tecnología</li>
                  <li><strong>Sección:</strong> 1.7</li>
                  <li><strong>Profesora:</strong> Violeta Reaño</li>
                  <li><strong>Institución:</strong> Universidad de Ingeniería y Tecnología - UTEC</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Descripción</h3>
                <p className="text-slate-600">
                  Sistema interactivo de monitoreo acústico que mapea los sonidos urbanos 
                  del distrito de Barranco, explorando la relación entre espacio urbano y 
                  paisaje sonoro a través de tecnologías digitales.
                </p>
              </div>
            </div>
          </div>

          {/* Equipo de Desarrollo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Integrantes - Grupo 5
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 border-l-4 border-amber-500">
                  <h3 className="font-semibold text-slate-800">{member.name}</h3>
                  <p className="text-slate-600 text-sm">Código: {member.code}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}