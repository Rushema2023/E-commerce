import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { isSupabaseConfigured, supabase, supabaseConfigurationError } from '../../lib/supabase'
import type { UserProfile } from '../../types'

interface AuthContextType {
    user: User | null
    session: Session | null
    profile: UserProfile | null
    isAdmin: boolean
    loading: boolean
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    async function fetchProfile(userId: string) {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
            setProfile(data as UserProfile)
        } catch {
            setProfile(null)
        }
    }

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setLoading(false)
            return
        }
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    async function signUp(email: string, password: string, fullName: string) {
        if (!isSupabaseConfigured) return { error: supabaseConfigurationError }
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        })
        return { error: error?.message ?? null }
    }

    async function signIn(email: string, password: string) {
        if (!isSupabaseConfigured) return { error: supabaseConfigurationError }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
    }

    async function signOut() {
        if (!isSupabaseConfigured) return
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                profile,
                isAdmin: profile?.is_admin ?? false,
                loading,
                signUp,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
