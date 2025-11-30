
function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
                <div className="hidden w-full bg-slate-900 p-10 text-white md:block md:w-1/2">
                    <div className="flex h-full flex-col justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Plataforma Judicial</p>
                            <h1 className="mt-6 text-4xl font-semibold leading-tight">Accede a la plataforma administrativa</h1>
                            <p className="mt-4 text-base text-slate-200">
                                Gestiona expedientes, revisa notificaciones y mantente al tanto de tus casos en cualquier momento.
                            </p>
                        </div>
                        <div className="mt-10 rounded-xl bg-slate-800/70 p-6">
                            <p className="text-sm text-slate-300">Seguridad multicapa · Disponibilidad 24/7 · Soporte especializado</p>
                        </div>
                    </div>
                </div>

                <div className="w-full p-8 sm:p-10 md:w-1/2">
                    <div className="mb-8 text-center md:text-left">
                        <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Bienvenido</p>
                        <h2 className="mt-3 text-3xl font-semibold text-slate-900">Inicia sesión</h2>
                        <p className="mt-2 text-sm text-slate-500">Ingresa tus credenciales para continuar</p>
                    </div>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-600" htmlFor="username">Usuario</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                placeholder="usuario@dominio.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-600" htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <label className="inline-flex items-center text-sm text-slate-600">
                                <input type="checkbox" className="mr-2 h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500" />
                                Recordar sesión
                            </label>
                            <a className="text-sm font-medium text-slate-700 hover:text-slate-900" href="#">¿Olvidaste tu contraseña?</a>
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-slate-900 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                        >
                            Entrar
                        </button>
                        <p className="text-center text-sm text-slate-500">
                            ¿No tienes cuenta? <a className="font-medium text-slate-700 hover:text-slate-900" href="#">Contacta con soporte</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default LoginPage;