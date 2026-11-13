import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { toast } from 'sonner'

const NAV = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: Package, label: 'Products', end: false },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders', end: false },
]

export default function AdminLayout() {
    const { signOut, profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut()
        toast.success('Signed out')
    }

    return (
        <div className="min-h-screen bg-[#FAF8F4] flex">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-[#343B32] flex flex-col z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="block">
                        <span className="text-xl font-serif font-bold text-white">Berwa</span>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-[#A8C3A0] block -mt-0.5">Collections · Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {NAV.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#A8C3A0] text-[#343B32]' : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-[#A8C3A0] flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[#343B32]">
                                {(profile?.full_name ?? 'A').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-xs font-medium truncate">{profile?.full_name ?? 'Admin'}</p>
                            <span className="text-white/40 text-[10px]">Administrator</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-[#EDE4D8] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-1.5 rounded-lg text-[#777] hover:bg-[#EDE4D8]"
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="hidden lg:block">
                        <p className="text-xs text-[#777]">Welcome back, {profile?.full_name ?? 'Admin'}</p>
                    </div>
                    <Link to="/" className="text-xs text-[#4285F4] hover:underline flex items-center gap-1">
                        View Store <ChevronRight size={12} />
                    </Link>
                </header>

                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
