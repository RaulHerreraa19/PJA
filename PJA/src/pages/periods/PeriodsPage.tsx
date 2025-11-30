import { useEffect, useState } from 'react'
import { fetchPeriods } from '../../api/periods'
import type { Period } from '../../types'

const PeriodsPage = () => {
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchPeriods()
        setPeriods(data)
      } catch (error) {
        setError('No se pudieron obtener los periodos')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Calendario</p>
        <h2 className="text-2xl font-semibold text-slate-900">Periodos de nomina</h2>
        <p className="text-sm text-slate-500">Conecta con tu modulo de nomina para abrir/cerrar periodos automaticamente.</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-sm text-slate-500">
          Cargando periodos...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {periods.map((period) => (
          <article key={period.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Periodo</p>
                <h3 className="text-xl font-semibold text-slate-900">{period.name}</h3>
              </div>
              <span
                className={`rounded-full px-4 py-1 text-xs font-semibold ${
                  period.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {period.status === 'open' ? 'Abierto' : 'Cerrado'}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
            </p>
          </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default PeriodsPage
