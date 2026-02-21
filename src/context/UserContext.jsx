import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'lingo-user'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore
    }
  }, [user])

  const value = useMemo(
    () => ({
      user,
      login: ({ name, role }) => setUser({ name, role }),
      logout: () => setUser(null),
    }),
    [user],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return ctx
}

