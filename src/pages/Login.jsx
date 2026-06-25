import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user, authReady, login, signup, resetPassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authReady && user) {
      navigate('/', { replace: true })
    }
  }, [authReady, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isRegistering) {
        const { needsEmailConfirmation } = await signup(email, password)
        if (needsEmailConfirmation) {
          alert('Cuenta creada. Revisa tu correo para confirmar o pide al admin que confirme tu usuario en Supabase.')
        } else {
          navigate('/', { replace: true })
        }
      } else {
        await login(email, password)
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
        Cargando…
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : isRegistering ? 'Registrarse' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering)
              setError(null)
            }}
            className="block w-full text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
          {!isRegistering && (
            <button
              type="button"
              disabled={loading || !email}
              onClick={async () => {
                setError(null)
                setLoading(true)
                try {
                  await resetPassword(email)
                  alert('Revisa tu correo para restablecer la contraseña.')
                } catch (err) {
                  setError(err.message)
                } finally {
                  setLoading(false)
                }
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              ¿Olvidaste la contraseña?
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
