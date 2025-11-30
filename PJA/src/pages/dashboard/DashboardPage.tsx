import { useEffect, useState } from 'react'
import { fetchEmployees } from '../../api/employees'
import { fetchAttendance } from '../../api/attendance'
import { fetchPeriods } from '../../api/periods'
import type { AttendanceRecord } from '../../types'

const DashboardPage = () => {
  const [activeEmployees, setActiveEmployees] = useState(0)
  const [openPeriods, setOpenPeriods] = useState(0)
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [lastCheck, setLastCheck] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [employees, attendance, periods] = await Promise.all([
          fetchEmployees(),
          fetchAttendance(),
          fetchPeriods(),
        ])

        setActiveEmployees(employees.filter((employee) => employee.status === 'active').length)
        setAttendanceCount(attendance.length)
        setOpenPeriods(periods.filter((period) => period.status === 'open').length)

        if (attendance.length > 0) {
          const ordered = [...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setLastCheck(ordered[0])
        } else {
          setLastCheck(null)
        }
      } catch (error) {
        setError('No se pudo cargar el tablero')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const renderLastCheck = () => {
    if (!lastCheck) return 'Sin datos'
    const label = lastCheck.employee ? `${lastCheck.employee.firstName} ${lastCheck.employee.lastName}` : 'Empleado'
    const time = lastCheck.checkIn ?? lastCheck.checkOut ?? lastCheck.date
    return `${label} · ${new Date(time).toLocaleString()}`
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Trabajadores activos</p>
          <h3 className="mt-3 text-4xl font-semibold text-slate-900">{activeEmployees}</h3>
          <p className="text-sm text-slate-500">Registros provistos por la API</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Periodos abiertos</p>
          <h3 className="mt-3 text-4xl font-semibold text-emerald-600">{openPeriods}</h3>
          <p className="text-sm text-slate-500">Basado en /periods</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ultima checada</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">{renderLastCheck()}</h3>
          <p className="text-sm text-slate-500">{attendanceCount} registros sincronizados</p>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-10 text-center text-slate-500">
          Actualizando metricas...
        </div>
      )}
    </section>
  )
}

export default DashboardPage
