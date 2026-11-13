import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

interface ProtectedRouteProps {
    children: React.ReactNode
    adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const { user, isAdmin, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
                <div className="w-8 h-8 border-2 border-[#A8C3A0] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) return <Navigate to="/auth/login" replace />
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />

    return <>{children}</>
}
