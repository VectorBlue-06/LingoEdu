import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'lingo-theme-mode'
const EFFECTS_KEY = 'lingo-effects-enabled'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        try {
            return window.localStorage.getItem(STORAGE_KEY) || 'light'
        } catch {
            return 'light'
        }
    })

    const [effectsEnabled, setEffectsEnabled] = useState(() => {
        try {
            const stored = window.localStorage.getItem(EFFECTS_KEY)
            return stored === null ? true : stored === 'true'
        } catch {
            return true
        }
    })

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, mode)
        } catch {
            // ignore
        }
    }, [mode])

    useEffect(() => {
        try {
            window.localStorage.setItem(EFFECTS_KEY, String(effectsEnabled))
        } catch {
            // ignore
        }
    }, [effectsEnabled])

    const value = useMemo(
        () => ({
            mode,
            effectsEnabled,
            toggleMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
            toggleEffects: () => setEffectsEnabled((prev) => !prev),
        }),
        [mode, effectsEnabled],
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeMode() {
    const ctx = useContext(ThemeContext)
    if (!ctx) {
        throw new Error('useThemeMode must be used within a ThemeProvider')
    }
    return ctx
}
