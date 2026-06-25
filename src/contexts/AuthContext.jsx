import { createContext, useContext, useEffect, useState } from 'react'
import { authRedirectUrl, supabase } from '../utils/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [needsPasswordUpdate, setNeedsPasswordUpdate] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (event === 'PASSWORD_RECOVERY') {
        setNeedsPasswordUpdate(true)
      }

      if (nextUser) {
        loadRole(nextUser.id)
      } else {
        setRole(null)
      }

      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadRole(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    setRole(data?.role ?? 'collaborator')
  }

  function applySession(session) {
    const nextUser = session?.user ?? null
    setUser(nextUser)
    if (nextUser) {
      return loadRole(nextUser.id)
    }
    setRole(null)
    return Promise.resolve()
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!data.session) {
      throw new Error('No se pudo iniciar sesión. Comprueba que el email esté confirmado en Supabase.')
    }
    await applySession(data.session)
  }

  async function signup(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: authRedirectUrl('/') },
    })
    if (error) throw error
    if (data.session) {
      await applySession(data.session)
    }
    return { needsEmailConfirmation: !data.session }
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectUrl('/reset-password'),
    })
    if (error) throw error
  }

  async function updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    setNeedsPasswordUpdate(false)
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setRole(null)
    setNeedsPasswordUpdate(false)
  }

  const value = {
    user,
    role,
    authReady,
    needsPasswordUpdate,
    login,
    signup,
    resetPassword,
    updatePassword,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
