import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="space-y-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">404</p>
      <h1 className="text-4xl font-semibold text-slate-900">Pagina no encontrada</h1>
      <p className="text-sm text-slate-500">Revisa la ruta o regresa al panel principal.</p>
      <div className="flex justify-center gap-4">
        <Link to="/dashboard" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Volver al dashboard
        </Link>
        <Link to="/login" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
          Login
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
