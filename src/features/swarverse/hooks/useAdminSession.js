import { useEffect, useState } from 'react'
import { ADMIN_EMAIL } from '../constants'

export function useAdminSession(supabase) {
  const [session, setSession] = useState(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  const user = session?.user || null
  const isAdmin = Boolean(user?.email && ADMIN_EMAIL && user.email.toLowerCase() === ADMIN_EMAIL)

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let active = true

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!active) return
      if (error) setAuthError(error.message)
      setSession(data.session || null)
    }

    syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null)
      setAuthError('')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const openAdminLogin = () => {
    setAuthError('')
    setAuthMessage('')
    setShowAdminLogin(true)
  }

  const closeAdminLogin = () => {
    if (authLoading) return
    setShowAdminLogin(false)
    setAuthError('')
    setPassword('')
  }

  const handleSignIn = async (event) => {
    event.preventDefault()

    if (!supabase || !loginEmail.trim() || !password.trim()) return false

    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password,
    })

    setAuthLoading(false)

    if (error) {
      setAuthError(error.message)
      return false
    }

    setPassword('')

    if (!data.user || data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      setAuthMessage('Signed in, but this account is read-only here.')
      return false
    }

    setShowAdminLogin(false)
    setAuthMessage('Signed in successfully.')
    return true
  }

  const handleSignOut = async () => {
    if (!supabase) return false

    setAuthLoading(true)
    setAuthError('')
    const { error } = await supabase.auth.signOut()
    setAuthLoading(false)

    if (error) {
      setAuthError(error.message)
      return false
    }

    setSession(null)
    setLoginEmail('')
    setPassword('')
    setAuthMessage('')
    return true
  }

  return {
    session,
    user,
    isAdmin,
    loginEmail,
    password,
    authLoading,
    authMessage,
    authError,
    showAdminLogin,
    setLoginEmail,
    setPassword,
    openAdminLogin,
    closeAdminLogin,
    handleSignIn,
    handleSignOut,
  }
}
