import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { toast } from 'sonner'

export function LoginPage() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await signIn(email, password)
        setLoading(false)
        if (error) {
            toast.error(error)
        } else {
            toast.success('Welcome back!')
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 shadow-sm">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block mb-4">
                            <span className="text-2xl font-serif font-bold text-[#343B32]">Berwa</span>
                            <span className="text-xs uppercase tracking-[0.3em] text-[#777] block -mt-1">Collections</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-[#343B32]">Welcome back</h1>
                        <p className="text-[#777] text-sm mt-1">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-[#343B32] mb-1.5">
                                Email address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-[#EDE4D8] rounded-lg text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0] bg-[#FAF8F4]"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-[#343B32] mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pr-10 border border-[#EDE4D8] rounded-lg text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0] bg-[#FAF8F4]"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-[#343B32]"
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            id="login-submit"
                            className="w-full bg-[#343B32] text-white py-3 rounded-lg font-semibold hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[#777] mt-6">
                        Don't have an account?{' '}
                        <Link to="/auth/signup" className="text-[#4285F4] hover:underline font-medium">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export function SignUpPage() {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters.')
            return
        }
        setLoading(true)
        const { error } = await signUp(email, password, fullName)
        setLoading(false)
        if (error) {
            toast.error(error)
        } else {
            toast.success('Account created! Check your email to verify.')
            navigate('/auth/login')
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 shadow-sm">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block mb-4">
                            <span className="text-2xl font-serif font-bold text-[#343B32]">Berwa</span>
                            <span className="text-xs uppercase tracking-[0.3em] text-[#777] block -mt-1">Collections</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-[#343B32]">Create an account</h1>
                        <p className="text-[#777] text-sm mt-1">Join Berwa Collections</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="signup-name" className="block text-sm font-medium text-[#343B32] mb-1.5">Full name</label>
                            <input
                                id="signup-name"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-[#EDE4D8] rounded-lg text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0] bg-[#FAF8F4]"
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label htmlFor="signup-email" className="block text-sm font-medium text-[#343B32] mb-1.5">Email address</label>
                            <input
                                id="signup-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-[#EDE4D8] rounded-lg text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0] bg-[#FAF8F4]"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="signup-password" className="block text-sm font-medium text-[#343B32] mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    id="signup-password"
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-3 pr-10 border border-[#EDE4D8] rounded-lg text-sm text-[#343B32] focus:outline-none focus:border-[#A8C3A0] bg-[#FAF8F4]"
                                    placeholder="At least 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-[#343B32]"
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            id="signup-submit"
                            className="w-full bg-[#343B32] text-white py-3 rounded-lg font-semibold hover:bg-[#A8C3A0] hover:text-[#343B32] transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[#777] mt-6">
                        Already have an account?{' '}
                        <Link to="/auth/login" className="text-[#4285F4] hover:underline font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
